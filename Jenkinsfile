pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Secret Scanning') {
            steps {
                sh '''
                    curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.21.2/gitleaks_8.21.2_linux_x64.tar.gz -o gitleaks.tar.gz
                    tar -xzf gitleaks.tar.gz gitleaks
                    chmod +x gitleaks
                    ./gitleaks detect --source . --config .gitleaks.toml --verbose --no-git
                    rm -f gitleaks gitleaks.tar.gz
                '''
            }
        }

        stage('Install & Build Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Install & Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Dependency Audit') {
            steps {
                dir('backend') {
                    sh 'npm audit --audit-level=high || true'
                }
                dir('frontend') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    sh '''
                        rm -rf sonar-scanner.zip sonar-scanner-5.0.1.3006-linux
                        which unzip || (apt-get update -qq && apt-get install -y -qq unzip)
                        curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
                        unzip -oq sonar-scanner.zip
                        ./sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner -Dsonar.projectKey=FixIt
                        rm -rf sonar-scanner.zip sonar-scanner-5.0.1.3006-linux
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t fixit-backend:${BUILD_NUMBER} ./backend
                    docker build -t fixit-frontend:${BUILD_NUMBER} ./frontend
                '''
            }
        }

        stage('Container Vulnerability Scanning') {
            steps {
                sh '''
                    echo "=== Installing Trivy ==="

                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | \
                        sh -s -- -b ./trivy-bin

                    echo "=== Trivy version ==="
                    ./trivy-bin/trivy --version

                    # Cache persistant hors workspace : la DB des vulnerabilites
                    # est reutilisee entre les builds, evite un re-telechargement
                    # a chaque run.
                    mkdir -p /var/jenkins_home/trivy-cache

                    # --- Scan CRITICAL : bloquant ---
                    scan_critical() {
                        image="$1"
                        report="$2"
                        attempt=1
                        max_attempts=3

                        while [ "$attempt" -le "$max_attempts" ]; do
                            echo "=== [CRITICAL] Scanning $image (tentative $attempt/$max_attempts) ==="

                            if ./trivy-bin/trivy image \
                                --cache-dir /var/jenkins_home/trivy-cache \
                                --skip-db-update \
                                --severity CRITICAL \
                                --exit-code 1 \
                                --ignore-unfixed \
                                --timeout 15m \
                                --format table \
                                --output "$report" \
                                "$image"; then
                                echo "=== $image : aucune faille CRITICAL ==="
                                return 0
                            fi

                            echo "Tentative $attempt echouee pour $image"
                            attempt=$((attempt + 1))
                            [ "$attempt" -le "$max_attempts" ] && sleep 10
                        done

                        echo "ECHEC: faille(s) CRITICAL detectee(s) pour $image apres $max_attempts tentatives"
                        return 1
                    }

                    # --- Scan HIGH : non-bloquant, juste un rapport ---
                    scan_high_report() {
                        image="$1"
                        report="$2"

                        echo "=== [HIGH] Scanning $image (rapport uniquement) ==="

                        ./trivy-bin/trivy image \
                            --cache-dir /var/jenkins_home/trivy-cache \
                            --skip-db-update \
                            --severity HIGH \
                            --exit-code 0 \
                            --ignore-unfixed \
                            --timeout 15m \
                            --format table \
                            --output "$report" \
                            "$image" || true
                    }

                    # Backend
                    scan_critical fixit-backend:${BUILD_NUMBER} trivy-critical-backend.txt
                    critical_backend_status=$?
                    scan_high_report fixit-backend:${BUILD_NUMBER} trivy-high-backend.txt

                    # Frontend
                    scan_critical fixit-frontend:${BUILD_NUMBER} trivy-critical-frontend.txt
                    critical_frontend_status=$?
                    scan_high_report fixit-frontend:${BUILD_NUMBER} trivy-high-frontend.txt

                    echo "=== Rapports HIGH generes (non-bloquants), consultables dans les artifacts ==="

                    # Le pipeline echoue seulement si une image a une faille CRITICAL
                    if [ "$critical_backend_status" -ne 0 ] || [ "$critical_frontend_status" -ne 0 ]; then
                        echo "ECHEC: au moins une image contient une faille CRITICAL corrigible"
                        exit 1
                    fi

                    echo "=== Trivy scan completed successfully ==="
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'trivy-*.txt', allowEmptyArchive: true

            sh '''
                echo "=== Cleaning up disk space ==="

                docker image rm fixit-backend:${BUILD_NUMBER} \
                               fixit-frontend:${BUILD_NUMBER} || true

                rm -rf ./trivy-bin

                docker system prune -f || true
                docker builder prune -f || true
            '''
        }

        success {
            echo ' Pipeline réussi'
        }

        failure {
            echo ' Pipeline échoué'
        }
    }
}