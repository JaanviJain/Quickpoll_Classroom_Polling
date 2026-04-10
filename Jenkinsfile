pipeline {
    agent any



    environment {
        CI = 'true'
    }

    stages {
        stage('Initialize') {
            steps {
                echo 'Checking Environment...'
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Install Backend') {
            steps {
                dir('backend') {
                    echo 'Installing Backend Dependencies...'
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend') {
            steps {
                dir('frontend') {
                    echo 'Installing Frontend Dependencies...'
                    bat 'npm install'
                }
            }
        }

        stage('Lint & Check') {
            steps {
                echo 'Running Static Code Analysis...'
                bat 'npm run lint'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    echo 'Building Production Bundle...'
                    bat 'npm run build'
                }
            }
        }

        stage('Finalize') {
            steps {
                echo 'QuickPoll CI Pipeline completed successfully!'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up and reporting results...'
        }
        success {
            echo 'Build passed! System is stable.'
        }
        failure {
            echo 'Build failed. Check the logs above for errors.'
        }
    }
}
