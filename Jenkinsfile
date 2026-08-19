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
                    set -e

                    echo "=== Installing Trivy ==="

                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | \
                        sh -s -- -b ./trivy-bin

                    echo "=== Trivy version ==="
                    ./trivy-bin/trivy --version

                    # Cache persistant hors workspace : la DB des vulnerabilites
                    # est reutilisee entre les builds, evite un re-telechargement
                    # a chaque run (source du probleme reseau initial).
                    mkdir -p /var/jenkins_home/trivy-cache

                    scan_image() {
                        image="$1"
                        attempt=1
                        max_attempts=3

                        while [ "$attempt" -le "$max_attempts" ]; do
                            echo "=== Scanning $image (tentative $attempt/$max_attempts) ==="

                            if ./trivy-bin/trivy image \
                                --cache-dir /var/jenkins_home/trivy-cache \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                --ignore-unfixed \
                                --timeout 15m \
                                "$image"; then
                                echo "=== $image : scan reussi ==="
                                return 0
                            fi

                            echo "Tentative $attempt echouee pour $image"
                            attempt=$((attempt + 1))
                            [ "$attempt" -le "$max_attempts" ] && sleep 10
                        done

                        echo "ECHEC: toutes les tentatives de scan ont echoue pour $image"
                        return 1
                    }

                    # Si l'une des deux images echoue apres 3 tentatives,
                    # scan_image retourne 1 et, grace a "set -e", tout le
                    # stage echoue correctement (au lieu d'etre marque
                    # "reussi" a tort).
                    scan_image fixit-backend:${BUILD_NUMBER}
                    scan_image fixit-frontend:${BUILD_NUMBER}

                    echo "=== Trivy scan completed successfully ==="
                '''
            }
        }
    }

    post {
        always {
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