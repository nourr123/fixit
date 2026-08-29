pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }
    
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

                    ./gitleaks detect \
                        --source . \
                        --config .gitleaks.toml \
                        --verbose \
                        --no-git

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
                        export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
                        export PATH=$JAVA_HOME/bin:$PATH

                        rm -rf sonar-scanner.zip sonar-scanner-*-linux-x64

                        which unzip || (
                            apt-get update -qq &&
                            apt-get install -y -qq unzip
                        )

                        curl -sSLo sonar-scanner.zip \
                            https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-7.0.2.4839-linux-x64.zip

                        unzip -oq sonar-scanner.zip

                        echo "=== Java utilisé ==="
                        java -version

                        ./sonar-scanner-7.0.2.4839-linux-x64/bin/sonar-scanner \
                            -Dsonar.projectKey=FixIt

                        rm -rf sonar-scanner.zip sonar-scanner-7.0.2.4839-linux-x64
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "=== Building Docker images ==="

                    docker build --no-cache \
                        -t fixit-backend:${BUILD_NUMBER} \
                        ./backend

                    docker build --no-cache \
                        -t fixit-frontend:${BUILD_NUMBER} \
                        ./frontend
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

                    mkdir -p /var/jenkins_home/trivy-cache

                    # ==========================================
                    # CRITICAL - BLOCKING
                    # ==========================================

                    scan_critical() {
                        image="$1"
                        report="$2"
                        attempt=1
                        max_attempts=3

                        while [ "$attempt" -le "$max_attempts" ]; do

                            echo "=== [CRITICAL] Scanning $image (attempt $attempt/$max_attempts) ==="

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

                                echo "=== $image : no CRITICAL vulnerabilities ==="
                                return 0
                            fi

                            echo "Attempt $attempt failed"

                            attempt=$((attempt + 1))

                            [ "$attempt" -le "$max_attempts" ] && sleep 10
                        done

                        echo "ERROR: CRITICAL vulnerabilities detected in $image"
                        return 1
                    }

                    # ==========================================
                    # HIGH - NON BLOCKING
                    # ==========================================

                    scan_high_report() {
                        image="$1"
                        report="$2"

                        echo "=== [HIGH] Scanning $image (report only) ==="

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

                    # ==========================================
                    # BACKEND
                    # ==========================================

                    scan_critical \
                        fixit-backend:${BUILD_NUMBER} \
                        trivy-critical-backend.txt

                    critical_backend_status=$?

                    scan_high_report \
                        fixit-backend:${BUILD_NUMBER} \
                        trivy-high-backend.txt

                    # ==========================================
                    # FRONTEND
                    # ==========================================

                    scan_critical \
                        fixit-frontend:${BUILD_NUMBER} \
                        trivy-critical-frontend.txt

                    critical_frontend_status=$?

                    scan_high_report \
                        fixit-frontend:${BUILD_NUMBER} \
                        trivy-high-frontend.txt

                    echo "=== HIGH vulnerability reports generated ==="

                    # ==========================================
                    # QUALITY GATE
                    # ==========================================

                    if [ "$critical_backend_status" -ne 0 ] || \
                       [ "$critical_frontend_status" -ne 0 ]; then

                        echo "ERROR: At least one image contains CRITICAL vulnerabilities"
                        exit 1
                    fi

                    echo "=== Trivy scan completed successfully ==="
                '''
            }
        }

        // =====================================================
        // CD - PUSH IMAGES TO DOCKER HUB
        // =====================================================

        stage('Push to Registry') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                        echo "=== Logging in to Docker Hub ==="

                        echo "$DOCKER_PASS" | docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin

                        echo "=== Tagging Docker images ==="

                        # Backend
                        docker tag \
                            fixit-backend:${BUILD_NUMBER} \
                            $DOCKER_USER/fixit-backend:${BUILD_NUMBER}

                        docker tag \
                            fixit-backend:${BUILD_NUMBER} \
                            $DOCKER_USER/fixit-backend:latest

                        # Frontend
                        docker tag \
                            fixit-frontend:${BUILD_NUMBER} \
                            $DOCKER_USER/fixit-frontend:${BUILD_NUMBER}

                        docker tag \
                            fixit-frontend:${BUILD_NUMBER} \
                            $DOCKER_USER/fixit-frontend:latest

                        echo "=== Pushing backend ==="

                        docker push \
                            $DOCKER_USER/fixit-backend:${BUILD_NUMBER}

                        docker push \
                            $DOCKER_USER/fixit-backend:latest

                        echo "=== Pushing frontend ==="

                        docker push \
                            $DOCKER_USER/fixit-frontend:${BUILD_NUMBER}

                        docker push \
                            $DOCKER_USER/fixit-frontend:latest

                        echo "=== Docker images pushed successfully ==="

                        docker logout
                    '''
                }
            }
        }

        // =====================================================
        // CD - DEPLOY
        // =====================================================

        stage('Deploy') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                        echo "=== Starting deployment ==="

                        export DOCKERHUB_USER=$DOCKER_USER

                        echo "=== Pulling latest backend and frontend images ==="

                        echo "$DOCKER_PASS" | docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin

                        docker compose \
                            -f docker-compose.yml \
                            pull backend frontend

                        echo "=== Restarting backend and frontend ==="

                        docker compose \
                            -f docker-compose.yml \
                            up -d backend frontend

                        docker logout

                        echo "=== Deployment completed successfully ==="

                        echo "=== Running containers ==="

                        docker compose \
                            -f docker-compose.yml \
                            ps
                    '''
                }
            }
        }
    }

    post {

        always {

            archiveArtifacts \
                artifacts: 'trivy-*.txt', \
                allowEmptyArchive: true

            sh '''
                echo "=== Cleaning up disk space ==="

                # Remove only build-number images.
                # Do NOT remove Docker Hub latest images.

                docker image rm \
                    fixit-backend:${BUILD_NUMBER} \
                    fixit-frontend:${BUILD_NUMBER} || true

                rm -rf ./trivy-bin

                docker system prune -f || true

                docker builder prune -f || true
            '''
        }

        success {
            echo 'Pipeline réussi - CI/CD completed successfully'
        }

        failure {
            echo 'Pipeline échoué'
        }
    }
}