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
                    docker run --rm -v $(pwd):/repo -w /repo \
                        zricethezav/gitleaks:latest detect \
                        --source . --config .gitleaks.toml --verbose --no-git
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
    }

    post {
        success {
            echo ' Pipeline réussi'
        }
        failure {
            echo ' Pipeline échoué'
        }
    }
}