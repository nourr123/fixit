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
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b ./bin

                    echo "=== Scanning backend image ==="
                    ./bin/trivy image --severity HIGH,CRITICAL --exit-code 1 fixit-backend:${BUILD_NUMBER}

                    echo "=== Scanning frontend image ==="
                    ./bin/trivy image --severity HIGH,CRITICAL --exit-code 1 fixit-frontend:${BUILD_NUMBER}

                    rm -rf ./bin
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline réussi'
        }
        failure {
            echo '❌ Pipeline échoué'
        }
    }
}