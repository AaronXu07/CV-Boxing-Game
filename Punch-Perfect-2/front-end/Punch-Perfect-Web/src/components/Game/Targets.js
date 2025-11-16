
import { FRUIT_TYPES } from './FruitDrawings.js';

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

    checkOnScreen(x, y) {
        if(-this.radius/2 < this.x && this.x < this.canvasWidth+this.radius/2 && -this.radius/2 < this.y && this.y < this.canvasHeight+this.radius/2) {
            return true;
        } else {
            return false; 
        }
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
        
        // Select a random fruit type
        this.fruitType = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
        
        // Physics properties
        this.gravity = 0.6;
        this.initialVelocityY = -Math.random() * 15 - 20; // Random upward velocity
        this.velocityY = this.initialVelocityY;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        // Spawn fruits from random positions across the bottom
        this.x = (0.2 + Math.random() * 0.6) * canvasWidth; // Anywhere in center 60%
        this.velocityX = (Math.random() - 0.5) * 8; // Random horizontal velocity (left or right)
        
        // Start below screen
        this.y = canvasHeight + 50;
    }
    
    // Override collision methods - fruits can be hit by EITHER hand
    checkCollisionRight(x, y){
        const distance = Math.sqrt((x-this.x) ** 2 + (y-this.y) ** 2);
        return distance < this.radius + 30;
    }
    
    checkCollisionLeft(x, y){
        const distance = Math.sqrt((x-this.x) ** 2 + (y-this.y) ** 2);
        return distance < this.radius + 30;
    }
    
    draw(ctx){
        ctx.save();
        
        // Move to target position and apply rotation
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw the fruit
        this.fruitType.draw(ctx, this.radius);
        
        ctx.restore();
    }

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