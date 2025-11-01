export class Target{
    constructor(canvasWidth, canvasHeight){
        this.radius = 80;
        this.isHit = false;
        this.hand = Math.random()*2; // 0-1 = left hand, 1.01-2 = right hand
        
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
    
    draw(ctx){
        ctx.beginPath();

        if(this.hand > 1){
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 255, 1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        else{
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 162, 0, 1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    }

    checkCollisionRight(x, y){
        if(this.hand > 1){
            const distance = Math.sqrt((x-this.x) ** 2 + (y-this.y) ** 2)
            return distance < this.radius + 5;
        }
        return false;
    }
    checkCollisionLeft(x, y){
        if(this.hand <= 1){
            const distance = Math.sqrt((x-this.x) ** 2 + (y-this.y) ** 2)
            return distance < this.radius + 5;
        }
        return false;
    }

    hit(){
        this.isHit = true;
        this.color = 'rgba(0, 251, 71, 0.5)';
    }

    update(deltaTime){

    }
}