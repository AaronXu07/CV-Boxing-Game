
class BaseTarget{
    constructor(canvasWidth, canvasHeight){
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.radius = 80;
        this.isHit = false;
        this.hand = Math.random()*2; // 0-1 = left hand, 1.01-2 = right hand
    }
    
    draw(ctx){
        if(this.hand > 1){
            // Right hand target (Blue)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(140, 0, 255, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(140, 0, 255, 1)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 1)';
            ctx.fill();
        }
        else{
            // Left hand target (Orange) - Draw from largest to smallest

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 162, 0, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 162, 0, 1)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 1)';
            ctx.fill();
        }
    }

    checkCollisionRight(x, y){
        if(this.hand > 1){
            const distance = Math.sqrt((x-this.x) ** 2 + (y-this.y) ** 2)
            return distance < this.radius + 30;
        }
        return false;
    }
    checkCollisionLeft(x, y){
        if(this.hand <= 1){
            const distance = Math.sqrt((x-this.x) ** 2 + (y-this.y) ** 2)
            return distance < this.radius + 30;
        }
        return false;
    }

    hit(){
        this.isHit = true;
        this.color = 'rgba(0, 251, 71, 0.5)';
    }
}

export class StaticTarget extends BaseTarget{
    constructor(canvasWidth, canvasHeight) {
        super(canvasWidth, canvasHeight); 
        // Position based on which hand
        if(this.hand > 1){
            // Right hand target: spawn in middle-left 30% of canvas (20% - 50% from left)
            this.x = (0.2 + Math.random() * 0.3) * canvasWidth;
            this.y = (0.1 + Math.random() * 0.4) * canvasHeight; // (10% - 50%) vertically
        }
        else{
            // Left hand target: spawn in middle-right 30% of canvas (50% - 80% from left)
            this.x = (0.5 + Math.random() * 0.3) * canvasWidth;
            this.y = (0.1 + Math.random() * 0.4) * canvasHeight; // (10%-50%) vertically
        }
    }
}

export class FruitTarget extends BaseTarget {
    constructor(canvasWidth, canvasHeight){
        super(canvasWidth, canvasHeight); 
        
        // Physics properties
        this.gravity = 0.7;
        this.initialVelocityY = -Math.random() * 15 - 20; // Random upward velocity
        this.velocityY = this.initialVelocityY;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        // Position based on which hand
        if(this.hand > 1){
            // Right hand target: start from bottom-left
            this.x = (0.2 + Math.random() * 0.3) * canvasWidth;
            this.velocityX = Math.random() * 5; // Move right
        }
        else{
            // Left hand target: start from bottom-right
            this.x = (0.5 + Math.random() * 0.3) * canvasWidth;
            this.velocityX = -Math.random() * 5; // Move left
        }
        // Start below screen
        this.y = canvasHeight + 50;
    }
    
    // draw(ctx){
    //     ctx.save();
        
    //     // Move to target position and apply rotation
    //     ctx.translate(this.x, this.y);
    //     ctx.rotate(this.rotation);
        
    //     super.draw(ctx); 
        
    //     ctx.restore();
    // }

    update(){
        // Update position based on velocity
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Return false if target is off screen (to remove it)
        return this.y < this.canvasHeight + 100;

    }
}