# Create EKS (small dev cluster)
eksctl create cluster --name week6 --region us-east-1 --nodes 2 --node-type t3.medium

# Let kubectl talk to it
aws eks update-kubeconfig --name week6 --region us-east-1
