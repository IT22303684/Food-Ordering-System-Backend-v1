# Array of service names
$services = @(
    "api-gateway",
    "auth-service",
    "restaurant-service",
    "order-service",
    "delivery-service",
    "driver-service",
    "payment-service",
    "cart-service",
    "notification-service"
)

# Docker Hub username
$DOCKER_USERNAME = "dasunz"

# Build, tag and push each service
foreach ($service in $services) {
    Write-Host "`nProcessing $service..."
    
    # Build the image
    Write-Host "Building $service..."
    docker build -t "$service" "./$service"
    
    # Tag the image
    Write-Host "Tagging $service..."
    docker tag "$service" "$DOCKER_USERNAME/$service"
    
    # Push to Docker Hub
    Write-Host "Pushing $service to Docker Hub..."
    docker push "$DOCKER_USERNAME/$service"
}

Write-Host "`nAll images have been pushed to Docker Hub" 