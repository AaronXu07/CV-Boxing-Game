// ==================== FRUIT DRAWING FUNCTIONS ====================
// All fruit drawing functions for the FruitTarget class
// Each function takes (ctx, radius) and draws centered at (0, 0)

const drawWatermelon = (ctx, radius) => {
    // Dark green outer circle - more vibrant
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0D8B3A';
    ctx.fill();
    
    // Light green stripes - clipped to circle - brighter
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    
    ctx.strokeStyle = '#3CB371';
    ctx.lineWidth = radius / 8;
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * radius / 3, -radius * 1.5);
        ctx.lineTo(i * radius / 3, radius * 1.5);
        ctx.stroke();
    }
    ctx.restore();
    
    // Darker spots for texture
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius * 0.8;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, radius / 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 80, 0, 0.2)';
        ctx.fill();
    }
    ctx.restore();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 3, radius / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
};

const drawMango = (ctx, radius) => {
    // Mango shape (oval)
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.85, radius * 1.05, 0.3, 0, Math.PI * 2);
    
    // Gradient fill - more vibrant yellows and oranges
    const gradient = ctx.createRadialGradient(-radius / 4, -radius / 4, 0, 0, 0, radius);
    gradient.addColorStop(0, '#FFE600');
    gradient.addColorStop(0.5, '#FFB300');
    gradient.addColorStop(1, '#FF9500');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Red blush on one side - more intense
    ctx.beginPath();
    ctx.ellipse(radius / 3, -radius / 5, radius / 2.5, radius / 2, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 20, 60, 0.45)';
    ctx.fill();
    
    // Another blush spot
    ctx.beginPath();
    ctx.ellipse(-radius / 5, radius / 3, radius / 3, radius / 4, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 100, 0, 0.25)';
    ctx.fill();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 2.5, -radius / 2.5, radius / 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
};

const drawPineapple = (ctx, radius) => {
    // Body - more vibrant golden
    ctx.beginPath();
    ctx.ellipse(0, radius / 6, radius * 0.8, radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F4C430';
    ctx.fill();
    
    // Diamond pattern
    ctx.strokeStyle = '#996515';
    ctx.lineWidth = 2;
    for (let y = -radius / 2; y < radius; y += radius / 4) {
        for (let x = -radius / 2; x < radius / 2; x += radius / 4) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + radius / 8, y + radius / 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + radius / 8, y);
            ctx.lineTo(x, y + radius / 8);
            ctx.stroke();
        }
    }
    
    // Green leaves on top - more vibrant green
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, -radius / 2);
        ctx.lineTo(Math.cos(angle) * radius / 3, -radius - radius / 3);
        ctx.lineTo(Math.cos(angle + 0.3) * radius / 4, -radius / 2);
        ctx.fillStyle = '#32CD32';
        ctx.fill();
    }
};

const drawCoconut = (ctx, radius) => {
    // Brown coconut - richer, more vibrant browns
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(-radius / 3, -radius / 3, 0, 0, 0, radius * 1.2);
    gradient.addColorStop(0, '#C19A6B');
    gradient.addColorStop(0.6, '#A0522D');
    gradient.addColorStop(1, '#6B4423');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Fiber texture - fixed positions with more visible color
    const fibers = [];
    for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2;
        for (let j = 0; j < 3; j++) {
            const dist = (0.3 + j * 0.25) * radius;
            fibers.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist
            });
        }
    }
    
    fibers.forEach(fiber => {
        ctx.beginPath();
        ctx.arc(fiber.x, fiber.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 90, 43, 0.8)';
        ctx.fill();
    });
    
    // Three dots at top - darker brown
    const dotY = -radius / 2;
    [-0.3, 0, 0.3].forEach(offset => {
        ctx.beginPath();
        ctx.arc(offset * radius / 2, dotY, radius / 10, 0, Math.PI * 2);
        ctx.fillStyle = '#4A2C1A';
        ctx.fill();
        
        // Inner shadow on dots
        ctx.beginPath();
        ctx.arc(offset * radius / 2 - radius / 30, dotY - radius / 30, radius / 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
    });
    
    // Subtle highlight - warmer tone
    ctx.beginPath();
    ctx.arc(-radius / 2.5, -radius / 2.5, radius / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(210, 180, 140, 0.45)';
    ctx.fill();
};

const drawStrawberry = (ctx, radius) => {
    // Red body (better strawberry shape - wider at top, pointed at bottom) - brighter red
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.8);  // Bottom point
    
    // Right side curve
    ctx.quadraticCurveTo(radius * 0.7, radius * 0.2, radius * 0.6, -radius * 0.2);
    ctx.quadraticCurveTo(radius * 0.5, -radius * 0.5, radius * 0.2, -radius * 0.5);
    
    // Top right indent
    ctx.lineTo(radius * 0.1, -radius * 0.3);
    
    // Top center
    ctx.lineTo(0, -radius * 0.4);
    
    // Top left indent
    ctx.lineTo(-radius * 0.1, -radius * 0.3);
    
    // Left side
    ctx.lineTo(-radius * 0.2, -radius * 0.5);
    ctx.quadraticCurveTo(-radius * 0.5, -radius * 0.5, -radius * 0.6, -radius * 0.2);
    ctx.quadraticCurveTo(-radius * 0.7, radius * 0.2, 0, radius * 0.8);
    
    ctx.fillStyle = '#FF1744';
    ctx.fill();
    
    // Seeds - fixed positions to avoid random flashing
    const seedPositions = [];
    for (let ring = 1; ring <= 4; ring++) {
        const seedsInRing = 4 + ring * 2;
        const y = -radius * 0.4 + (ring / 4) * radius * 1.0;
        const width = radius * 0.4 * (1 - ring / 5);
        for (let i = 0; i < seedsInRing; i++) {
            const x = ((i / (seedsInRing - 1)) - 0.5) * 2 * width;
            seedPositions.push({ x, y });
        }
    }
    
    seedPositions.forEach(pos => {
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 2, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFE873';
        ctx.fill();
    });
    
    // Green leaves on top - fuller crown
    const leafCount = 7;
    for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2 - Math.PI / 2;
        const nextAngle = ((i + 1) / leafCount) * Math.PI * 2 - Math.PI / 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.5);
        
        // Outer point of leaf
        const leafTipX = Math.cos(angle) * radius * 0.5;
        const leafTipY = -radius * 0.6 + Math.sin(angle) * radius * 0.3;
        ctx.lineTo(leafTipX, leafTipY);
        
        // Back to center area
        const midAngle = (angle + nextAngle) / 2;
        const midX = Math.cos(midAngle) * radius * 0.15;
        const midY = -radius * 0.45;
        ctx.lineTo(midX, midY);
        
        ctx.fillStyle = '#32CD32';
        ctx.fill();
    }
    
    // Highlight on strawberry
    ctx.beginPath();
    ctx.ellipse(-radius * 0.25, -radius * 0.1, radius / 5, radius / 6, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
};

const drawGreenApple = (ctx, radius) => {
    // Green apple body with slight indents at top - more vibrant green
    ctx.beginPath();
    ctx.arc(0, radius / 8, radius * 0.95, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(-radius / 4, -radius / 4, radius / 4, 0, 0, radius * 1.2);
    gradient.addColorStop(0, '#B8E62E');
    gradient.addColorStop(0.6, '#A4D116');
    gradient.addColorStop(1, '#7CB518');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Yellow-green tint - brighter
    ctx.beginPath();
    ctx.arc(-radius / 4, radius / 6, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(190, 255, 47, 0.3)';
    ctx.fill();
    
    // Stem
    ctx.beginPath();
    ctx.rect(-radius / 20, -radius * 0.95, radius / 10, radius / 3);
    ctx.fillStyle = '#654321';
    ctx.fill();
    
    // Leaf - brighter green
    ctx.beginPath();
    ctx.ellipse(radius / 4, -radius * 0.75, radius / 4, radius / 7, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#32CD32';
    ctx.fill();
    
    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(radius / 5, -radius * 0.75);
    ctx.lineTo(radius / 3, -radius * 0.75);
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 3, radius / 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
};

const drawRedApple = (ctx, radius) => {
    // Red apple body - more vibrant red
    ctx.beginPath();
    ctx.arc(0, radius / 8, radius * 0.95, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(-radius / 3, -radius / 4, radius / 4, 0, radius / 4, radius * 1.1);
    gradient.addColorStop(0, '#FF5555');
    gradient.addColorStop(0.5, '#F91850');
    gradient.addColorStop(1, '#C41E3A');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Yellow/orange blush - more vibrant
    ctx.beginPath();
    ctx.arc(radius / 2, radius / 4, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 220, 0, 0.3)';
    ctx.fill();
    
    // Stem
    ctx.beginPath();
    ctx.rect(-radius / 20, -radius * 0.95, radius / 10, radius / 3);
    ctx.fillStyle = '#654321';
    ctx.fill();
    
    // Leaf - brighter green
    ctx.beginPath();
    ctx.ellipse(radius / 4, -radius * 0.75, radius / 4, radius / 7, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#32CD32';
    ctx.fill();
    
    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(radius / 5, -radius * 0.75);
    ctx.lineTo(radius / 3, -radius * 0.75);
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 3, radius / 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
};

const drawKiwi = (ctx, radius) => {
    // Brown fuzzy exterior
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(-radius / 4, -radius / 4, 0, 0, 0, radius * 1.1);
    gradient.addColorStop(0, '#A0826D');
    gradient.addColorStop(0.6, '#8B7355');
    gradient.addColorStop(1, '#6B5744');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Fuzzy texture - fixed positions in spiral pattern
    const fuzzyHairs = [];
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 4; // Two spirals
        const dist = (i / 30) * radius * 0.9;
        fuzzyHairs.push({
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            angle: angle
        });
    }
    
    fuzzyHairs.forEach(hair => {
        ctx.beginPath();
        ctx.moveTo(hair.x, hair.y);
        const hairLength = radius / 12;
        ctx.lineTo(
            hair.x + Math.cos(hair.angle) * hairLength,
            hair.y + Math.sin(hair.angle) * hairLength
        );
        ctx.strokeStyle = '#6B5744';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 3, radius / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(160, 130, 109, 0.3)';
    ctx.fill();
};

const drawBanana = (ctx, radius) => {
    // Banana curve - more refined shape
    ctx.beginPath();
    ctx.moveTo(-radius / 2, -radius / 3);
    ctx.bezierCurveTo(-radius, 0, -radius, radius / 2, -radius / 3, radius);
    ctx.bezierCurveTo(0, radius * 1.1, radius / 2, radius, radius / 2, radius / 2);
    ctx.bezierCurveTo(radius / 2, 0, radius / 3, -radius / 2, -radius / 2, -radius / 3);
    
    // More vibrant yellow gradient
    const gradient = ctx.createLinearGradient(-radius, -radius / 2, radius / 2, radius);
    gradient.addColorStop(0, '#FFED4E');
    gradient.addColorStop(0.5, '#FFE135');
    gradient.addColorStop(1, '#F4C430');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Brown edge/ridge along banana
    ctx.beginPath();
    ctx.moveTo(-radius / 2, -radius / 3);
    ctx.bezierCurveTo(-radius, 0, -radius, radius / 2, -radius / 3, radius);
    ctx.strokeStyle = 'rgba(139, 90, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Fixed brown spots (not random to avoid flashing)
    const spots = [
        { x: -radius * 0.6, y: 0 },
        { x: -radius * 0.3, y: radius * 0.3 },
        { x: 0, y: radius * 0.5 },
        { x: radius * 0.2, y: radius * 0.2 },
        { x: -radius * 0.4, y: radius * 0.6 },
        { x: -radius * 0.7, y: radius * 0.25 },
        { x: radius * 0.3, y: 0 }
    ];
    
    spots.forEach(spot => {
        ctx.beginPath();
        ctx.ellipse(spot.x, spot.y, radius / 10, radius / 12, 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
        ctx.fill();
    });
    
    // Stem
    ctx.beginPath();
    ctx.rect(-radius * 0.6, -radius / 2, radius / 8, radius / 4);
    ctx.fillStyle = '#8B6914';
    ctx.fill();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius * 0.5, radius * 0.1, radius / 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
};

const drawLemon = (ctx, radius) => {
    // Lemon body (oval with points) - brighter yellow
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.9, radius * 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFEB3B';
    ctx.fill();
    
    // Pointed ends
    ctx.beginPath();
    ctx.moveTo(0, -radius * 1.1);
    ctx.lineTo(-radius / 8, -radius * 1.3);
    ctx.lineTo(radius / 8, -radius * 1.3);
    ctx.fillStyle = '#FFEB3B';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(0, radius * 1.1);
    ctx.lineTo(-radius / 8, radius * 1.3);
    ctx.lineTo(radius / 8, radius * 1.3);
    ctx.fill();
    
    // Texture
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius * 0.8;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 200, 0, 0.3)';
        ctx.fill();
    }
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 2, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
};

const drawLime = (ctx, radius) => {
    // Lime body - brighter lime green
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#39FF14';
    ctx.fill();
    
    // Darker patches
    ctx.beginPath();
    ctx.arc(radius / 3, radius / 4, radius / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(50, 205, 50, 0.3)';
    ctx.fill();
    
    // Texture
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius * 0.8;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 100, 0, 0.2)';
        ctx.fill();
    }
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
};

const drawOrange = (ctx, radius) => {
    // Orange body - more vibrant orange
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(-radius / 4, -radius / 4, 0, 0, 0, radius * 1.2);
    gradient.addColorStop(0, '#FFB347');
    gradient.addColorStop(0.7, '#FF9500');
    gradient.addColorStop(1, '#FF7F00');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Pitted texture - fixed positions
    const texturePoints = [];
    for (let ring = 0; ring < 4; ring++) {
        const pointsInRing = 8 + ring * 4;
        const ringRadius = (ring / 3.5) * radius * 0.85;
        for (let i = 0; i < pointsInRing; i++) {
            const angle = (i / pointsInRing) * Math.PI * 2;
            texturePoints.push({
                x: Math.cos(angle) * ringRadius,
                y: Math.sin(angle) * ringRadius
            });
        }
    }
    
    texturePoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(210, 105, 30, 0.4)';
        ctx.fill();
    });
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();
};

const drawPlum = (ctx, radius) => {
    // Purple plum body - more vibrant purple
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#A855F7';
    ctx.fill();
    
    // Darker shade on one side
    ctx.beginPath();
    ctx.arc(radius / 3, radius / 4, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 69, 255, 0.4)';
    ctx.fill();
    
    // Line down middle
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.strokeStyle = 'rgba(139, 69, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 2, -radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 150, 200, 0.4)';
    ctx.fill();
};

const drawPear = (ctx, radius) => {
    // Pear body (bottom part larger) - more vibrant golden-green
    ctx.beginPath();
    ctx.moveTo(0, -radius * 1.2);
    ctx.bezierCurveTo(-radius / 2, -radius, -radius, -radius / 3, -radius, radius / 3);
    ctx.bezierCurveTo(-radius, radius, 0, radius * 1.2, 0, radius * 1.2);
    ctx.bezierCurveTo(0, radius * 1.2, radius, radius, radius, radius / 3);
    ctx.bezierCurveTo(radius, -radius / 3, radius / 2, -radius, 0, -radius * 1.2);
    ctx.fillStyle = '#E6C84A';
    ctx.fill();
    
    // Green tint - brighter
    ctx.beginPath();
    ctx.arc(-radius / 3, 0, radius / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(170, 215, 50, 0.4)';
    ctx.fill();
    
    // Stem
    ctx.beginPath();
    ctx.rect(-radius / 20, -radius * 1.4, radius / 10, radius / 3);
    ctx.fillStyle = '#654321';
    ctx.fill();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-radius / 3, -radius / 2, radius / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
};

const drawPassionFruit = (ctx, radius) => {
    // Purple exterior - more vibrant
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#8B5CF6';
    ctx.fill();
    
    // Wrinkled texture
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * radius / 2, Math.sin(angle) * radius / 2, radius / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(147, 51, 234, 0.4)';
        ctx.fill();
    }
    
    // Spots
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius * 0.7;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.fill();
    }
};

const drawPeach = (ctx, radius) => {
    // Peach body - more vibrant peach
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE5B4';
    ctx.fill();
    
    // Red blush - more vibrant
    ctx.beginPath();
    ctx.arc(radius / 3, -radius / 4, radius / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-radius / 4, radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 107, 107, 0.4)';
    ctx.fill();
    
    // Fuzzy texture
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * 0.9;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 218, 185, 0.8)';
        ctx.fill();
    }
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.strokeStyle = 'rgba(210, 180, 140, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Leaf - brighter green
    ctx.beginPath();
    ctx.ellipse(radius / 2, -radius * 0.8, radius / 5, radius / 8, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#32CD32';
    ctx.fill();
};

const drawCherry = (ctx, radius) => {
    const cherryRadius = radius * 0.6;
    
    // Stems
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(-cherryRadius / 2, -cherryRadius / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(cherryRadius / 2, -cherryRadius / 2);
    ctx.stroke();
    
    // Left cherry - brighter red
    ctx.beginPath();
    ctx.arc(-cherryRadius / 2, 0, cherryRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#F91850';
    ctx.fill();
    
    // Left cherry highlight
    ctx.beginPath();
    ctx.arc(-cherryRadius / 2 - cherryRadius / 3, -cherryRadius / 3, cherryRadius / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    
    // Right cherry - brighter red
    ctx.beginPath();
    ctx.arc(cherryRadius / 2, 0, cherryRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#F91850';
    ctx.fill();
    
    // Right cherry highlight
    ctx.beginPath();
    ctx.arc(cherryRadius / 2 - cherryRadius / 3, -cherryRadius / 3, cherryRadius / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
};

// Bomb drawing function (hazard target)
const drawBomb = (ctx, radius) => {
    // Outer glow to make bomb visible on black background
    ctx.save();
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    
    // Bomb body (matte black sphere)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    const bodyGrad = ctx.createRadialGradient(-radius / 3, -radius / 3, 0, 0, 0, radius);
    bodyGrad.addColorStop(0, '#3a3a3a');
    bodyGrad.addColorStop(0.6, '#0f0f0f');
    bodyGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Subtle glossy highlight
    ctx.beginPath();
    ctx.arc(-radius / 3.5, -radius / 3.5, radius / 3.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    // Metal cap / fuse holder
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.9, radius * 0.36, radius * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3b3b3b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fuse rope
    ctx.save();
    ctx.translate(0, -radius * 0.98);
    ctx.rotate(-0.35);
    ctx.strokeStyle = '#6b4f2b';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(i * (radius * 0.06), 0);
        ctx.quadraticCurveTo(i * (radius * 0.06) + radius * 0.02, -radius * 0.08, (i + 1) * (radius * 0.06), 0);
        ctx.stroke();
    }
    ctx.restore();

    // Spark at tip of fuse
    ctx.save();
    ctx.translate(0, -radius * 0.98);
    ctx.rotate(-0.35);
    
    const sparkX = radius * 0.36;
    const sparkY = 0;
    const sparkRadius = radius * 0.18;
    const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, sparkRadius);
    sparkGrad.addColorStop(0, '#fff59d');
    sparkGrad.addColorStop(0.4, '#ffb74d');
    sparkGrad.addColorStop(1, 'rgba(255,87,34,0.2)');
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkRadius, 0, Math.PI * 2);
    ctx.fillStyle = sparkGrad;
    ctx.fill();

    // Small ember particles
    for (let i = 0; i < 6; i++) {
        const angle = (i - 3) * 0.14;
        const distance = radius * (0.4 + Math.random() * 0.15);
        ctx.beginPath();
        ctx.arc(sparkX + Math.cos(angle) * distance, sparkY + Math.sin(angle) * distance, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,160,60,' + (0.5 * Math.random()) + ')';
        ctx.fill();
    }
    
    ctx.restore();

    // Subtle worn circular decal (very faint)
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fill();
};
// Export array of all fruit types with their drawing functions
export const FRUIT_TYPES = [
    { name: 'watermelon', draw: drawWatermelon, color: '#0D8B3A' },
    { name: 'mango', draw: drawMango, color: '#FFA500' },
    { name: 'pineapple', draw: drawPineapple, color: '#FFD700' },
    { name: 'coconut', draw: drawCoconut, color: '#8B4513' },
    { name: 'strawberry', draw: drawStrawberry, color: '#FF1744' },
    { name: 'greenApple', draw: drawGreenApple, color: '#7CB342' },
    { name: 'redApple', draw: drawRedApple, color: '#E53935' },
    { name: 'kiwi', draw: drawKiwi, color: '#8D6E63' },
    { name: 'banana', draw: drawBanana, color: '#FFEB3B' },
    { name: 'lemon', draw: drawLemon, color: '#FFF176' },
    { name: 'lime', draw: drawLime, color: '#9CCC65' },
    { name: 'orange', draw: drawOrange, color: '#FF6F00' },
    { name: 'plum', draw: drawPlum, color: '#6A1B9A' },
    { name: 'pear', draw: drawPear, color: '#C0CA33' },
    { name: 'passionFruit', draw: drawPassionFruit, color: '#7B1FA2' },
    { name: 'peach', draw: drawPeach, color: '#FFB74D' },
    { name: 'cherry', draw: drawCherry, color: '#D32F2F' },
    { name: 'bomb', draw: drawBomb, color: '#212121' }
];

