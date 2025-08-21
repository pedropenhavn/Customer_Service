pipeline {
    agent { label 'bees-prod-01' }
    stages {
        stage('Code') {
            steps {
                echo "Cloning the code"
                git credentialsId: 'git-vila', branch: 'main', url: 'https://github.com/VilaTech/producers'
            }
        }
        stage('Copy Env File') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'producers.env', variable: 'ENV_FILE')]) {
                        sh "cp '${ENV_FILE}' /var/lib/jenkins/workspace/producers/.env"
                    }
                }
            }
        }
        stage('Build and Run Docker') {
            steps {
                script {
                    sh 'docker compose down'
                    sh 'docker compose up -d --build'
                }
            }
        }
    }
}
