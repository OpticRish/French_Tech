// Radar — Animated geometric radar background plugin
const { useRef, useEffect } = React;

function Radar({
    speed = 1,
    scale = 0.5,
    ringCount = 10,
    spokeCount = 10,
    ringThickness = 0.05,
    spokeThickness = 0.01,
    sweepSpeed = 1,
    sweepWidth = 2,
    sweepLobes = 1,
    color = "#9f29ff",
    backgroundColor = "#000000",
    falloff = 2,
    brightness = 1,
    enableMouseInteraction = true,
    mouseInfluence = 0.1
}) {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, tx: window.innerWidth / 2, ty: window.innerHeight / 2 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        let w, h, animId;
        let time = 0;

        // Parse color
        let r = 159, g = 41, b = 255;
        if (color.startsWith('#')) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e) => {
            if (!enableMouseInteraction) return;
            mouse.current.tx = e.clientX;
            mouse.current.ty = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove);

        function draw() {
            time += speed * 0.02;

            // Lerp mouse
            mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05;
            mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05;

            // Draw background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, w, h);

            // Calculate center (with mouse shifting)
            const baseX = w / 2;
            const baseY = h / 2;
            const centerShiftX = (mouse.current.x - baseX) * mouseInfluence;
            const centerShiftY = (mouse.current.y - baseY) * mouseInfluence;
            
            const cx = baseX + centerShiftX;
            const cy = baseY + centerShiftY;

            // Base dimensions
            const maxRadius = Math.max(w, h) * scale * 1.5;

            // 1. Draw Rings
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * brightness})`;
            ctx.lineWidth = maxRadius * ringThickness * 0.01;
            
            for (let i = 1; i <= ringCount; i++) {
                const radius = (maxRadius / ringCount) * i;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 2. Draw Spokes
            ctx.lineWidth = maxRadius * spokeThickness * 0.01;
            for (let i = 0; i < spokeCount; i++) {
                const angle = (Math.PI * 2) * (i / spokeCount);
                const ex = cx + Math.cos(angle) * maxRadius;
                const ey = cy + Math.sin(angle) * maxRadius;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            }

            // 3. Draw Sweeps (Radar conical gradients)
            // Save state for clipping or blending
            ctx.globalCompositeOperation = 'screen';
            
            for (let lobe = 0; lobe < sweepLobes; lobe++) {
                const baseAngle = time * sweepSpeed + (Math.PI * 2 * lobe) / sweepLobes;
                
                // Construct a Conic Gradient approximation
                const gradientLength = sweepWidth;
                const steps = 40;
                
                for (let s = 0; s < steps; s++) {
                    const stepAngle = baseAngle - (s / steps) * gradientLength;
                    const nextStepAngle = baseAngle - ((s+1) / steps) * gradientLength;
                    
                    // Falloff opacity
                    const progress = s / steps;
                    const alphaP = Math.pow(1 - progress, falloff);
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alphaP * brightness * 0.8})`;
                    
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, maxRadius, nextStepAngle, stepAngle);
                    ctx.closePath();
                    ctx.fill();
                }
                
                // Draw trailing bright line
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(baseAngle) * maxRadius, cy + Math.sin(baseAngle) * maxRadius);
                ctx.stroke();
            }

            ctx.globalCompositeOperation = 'source-over';
            
            animId = requestAnimationFrame(draw);
        }

        animId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [speed, scale, ringCount, spokeCount, ringThickness, spokeThickness, sweepSpeed, sweepWidth, sweepLobes, color, backgroundColor, falloff, brightness, enableMouseInteraction, mouseInfluence]);

    return React.createElement('canvas', {
        ref: canvasRef,
        style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none',
        }
    });
}

// Mount Radar
const radarBgRoot = document.getElementById('radar-bg-root');
if (radarBgRoot) {
    const root = ReactDOM.createRoot(radarBgRoot);
    root.render(React.createElement(Radar, {
        speed: 1,
        scale: 0.5,
        ringCount: 10,
        spokeCount: 10,
        ringThickness: 0.05,
        spokeThickness: 0.01,
        sweepSpeed: 1,
        sweepWidth: 2,
        sweepLobes: 1,
        color: "#9f29ff",
        backgroundColor: "#000000",
        falloff: 2,
        brightness: 1,
        enableMouseInteraction: true,
        mouseInfluence: 0.1
    }));
}
