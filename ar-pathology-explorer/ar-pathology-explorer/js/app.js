let hologramVisible = true;
let registrationComplete = false;
let planesVisible = false;
let moveInterval;
let currentPosition = { x: 0, y: 0, z: -1 };
let currentRotation = { x: 0, y: 0, z: 0 };
let currentScale = 1;
let menuOpen = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('AR Pathology Demo starting...');
    updateStatus('Position hologram over sample, then run AI Registration');
});

function aiRegistration() {
    const aiBtn = document.querySelector('#ai-btn');
    const statusText = document.querySelector('#registration-status');
    const alignmentScore = document.querySelector('#alignment-score');
    const touchControls = document.querySelector('#touch-controls');
    const planesBtn = document.querySelector('#planes-btn');
    const lesionIndicator = document.querySelector('#lesion-indicator');
    const hologram = document.querySelector('#sample-hologram');
    
    if (!hologram) {
        console.error('Hologram element not found');
        return;
    }
    
    aiBtn.textContent = 'Processing...';
    aiBtn.disabled = true;
    touchControls.style.display = 'none';
    
    statusText.setAttribute('value', 'AI REGISTRATION\nAnalyzing sample...');
    statusText.setAttribute('color', '#9c27b0');
    
    updateStatus('AI analyzing sample surface and orientation...');
    
    setTimeout(() => {
        alignmentScore.textContent = 'Sample detected! Analyzing surface features...';
        alignmentScore.className = 'score-good';
        
        setTimeout(() => {
            statusText.setAttribute('value', 'AI REGISTRATION\nOptimizing orientation...');
            alignmentScore.textContent = 'Fine-tuning hologram orientation...';
            
            const adjustedRotation = {
                x: currentRotation.x + (Math.random() - 0.5) * 8,
                y: currentRotation.y + (Math.random() - 0.5) * 12,
                z: currentRotation.z + (Math.random() - 0.5) * 6
            };
            
            hologram.setAttribute('animation__rotation', 
                `property: rotation; to: ${adjustedRotation.x} ${adjustedRotation.y} ${adjustedRotation.z}; dur: 1200; easing: easeInOutQuad`);
            currentRotation = adjustedRotation;
            
            setTimeout(() => {
                statusText.setAttribute('value', 'AI REGISTRATION\nFinalizing calibration...');
                alignmentScore.textContent = 'Calibrating hologram scale...';
                
                const adjustedScale = currentScale * (0.98 + Math.random() * 0.04);
                hologram.setAttribute('animation__scale', 
                    `property: scale; to: ${adjustedScale} ${adjustedScale} ${adjustedScale}; dur: 800; easing: easeInOutQuad`);
                currentScale = adjustedScale;
                
                setTimeout(() => {
                    hologram.removeAttribute('animation__rotation');
                    hologram.removeAttribute('animation__scale');
                    
                    registrationComplete = true;
                    
                    console.log('Hologram registered at position:', hologram.getAttribute('position'));
                    
                    aiBtn.textContent = 'Registration Complete';
                    aiBtn.classList.add('active');
                    aiBtn.disabled = false;
                    planesBtn.disabled = false;
                    
                    statusText.setAttribute('value', 'REGISTRATION COMPLETE\n94.7% confidence - Hologram locked to sample');
                    statusText.setAttribute('color', '#00ff88');
                    
                    alignmentScore.textContent = 'AI Registration: 94.7% confidence - Hologram locked!';
                    alignmentScore.className = 'score-excellent';
                    
                    lesionIndicator.setAttribute('visible', 'true');
                    
                    updateStatus('Registration complete! Try moving camera around the sample');
                }, 1000);
            }, 1200);
        }, 1500);
    }, 1000);
}

function toggleMenu() {
    const panel = document.querySelector('#control-panel');
    const btn = document.querySelector('#hamburger-btn');
    menuOpen = !menuOpen;
    panel.classList.toggle('open', menuOpen);
    btn.textContent = menuOpen ? '✕' : '☰';
}

function closeMenu() {
    const panel = document.querySelector('#control-panel');
    const btn = document.querySelector('#hamburger-btn');
    menuOpen = false;
    panel.classList.remove('open');
    btn.textContent = '☰';
}

function toggleHologram() {
    const hologram = document.querySelector('#sample-hologram');
    hologramVisible = !hologramVisible;
    hologram.setAttribute('visible', hologramVisible);
    
    const touchControls = document.querySelector('#touch-controls');
    if (hologramVisible && !registrationComplete) {
        touchControls.style.display = 'block';
    } else {
        touchControls.style.display = 'none';
    }
    
    updateStatus(hologramVisible ? 'Hologram visible' : 'Hologram hidden');
}

function showCuttingPlanes() {
    if (!registrationComplete) {
        updateStatus('Please complete AI Registration first');
        return;
    }
    
    const planesBtn = document.querySelector('#planes-btn');
    const cuttingPlanes = document.querySelector('#cutting-planes');
    const roiMarkers = document.querySelector('#roi-markers');
    const alignmentGrid = document.querySelector('#alignment-grid');
    
    planesVisible = !planesVisible;
    
    if (planesVisible) {
        cuttingPlanes.setAttribute('visible', 'true');
        roiMarkers.setAttribute('visible', 'true');
        alignmentGrid.setAttribute('visible', 'false');
        
        planesBtn.textContent = 'Hide Cut Guidance';
        planesBtn.classList.add('active');
        
        updateStatus('Cutting guidance active - Red plane shows optimal lesion sampling angle');
    } else {
        cuttingPlanes.setAttribute('visible', 'false');
        roiMarkers.setAttribute('visible', 'false');
        alignmentGrid.setAttribute('visible', 'true');
        
        planesBtn.textContent = 'Show Cut Guidance';
        planesBtn.classList.remove('active');
        
        updateStatus('Registration complete - Ready for cutting guidance');
    }
}

function startMove(direction) {
    if (registrationComplete) {
        updateStatus('Hologram registered - Use "Reset" to enable manual controls');
        return;
    }
    
    const speed = 0.02;
    moveInterval = setInterval(() => {
        const hologram = document.querySelector('#sample-hologram');
        
        switch(direction) {
            case 'left': currentPosition.x -= speed; break;
            case 'right': currentPosition.x += speed; break;
            case 'up': currentPosition.y += speed; break;
            case 'down': currentPosition.y -= speed; break;
            case 'closer': currentPosition.z += speed; break;
            case 'farther': currentPosition.z -= speed; break;
        }
        
        hologram.setAttribute('position', `${currentPosition.x} ${currentPosition.y} ${currentPosition.z}`);
    }, 50);
}

function startRotate(axis, direction) {
    if (registrationComplete) {
        updateStatus('Hologram registered - Use "Reset" to enable manual controls');
        return;
    }
    
    const speed = 2;
    moveInterval = setInterval(() => {
        const hologram = document.querySelector('#sample-hologram');
        
        if (axis === 'x') currentRotation.x += direction * speed;
        else if (axis === 'y') currentRotation.y += direction * speed;
        
        hologram.setAttribute('rotation', `${currentRotation.x} ${currentRotation.y} ${currentRotation.z}`);
    }, 50);
}

function startScale(direction) {
    if (registrationComplete) {
        updateStatus('Hologram registered - Use "Reset" to enable manual controls');
        return;
    }
    
    const speed = 0.02;
    moveInterval = setInterval(() => {
        const hologram = document.querySelector('#sample-hologram');
        currentScale += direction * speed;
        currentScale = Math.max(0.5, Math.min(2.0, currentScale));
        hologram.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
    }, 50);
}

function stopMove() {
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
}

function resetPosition() {
    if (registrationComplete) {
        updateStatus('Hologram registered - Use "Reset" to unlock');
        return;
    }
    
    const hologram = document.querySelector('#sample-hologram');
    
    currentPosition = { x: 0, y: 0, z: -1 };
    currentRotation = { x: 0, y: 0, z: 0 };
    currentScale = 1;
    
    hologram.setAttribute('position', '0 0 -1');
    hologram.setAttribute('rotation', '0 0 0');
    hologram.setAttribute('scale', '1 1 1');
    
    updateStatus('Hologram position reset to center');
}

function resetDemo() {
    const hologram = document.querySelector('#sample-hologram');
    const aiBtn = document.querySelector('#ai-btn');
    const planesBtn = document.querySelector('#planes-btn');
    const touchControls = document.querySelector('#touch-controls');
    const statusText = document.querySelector('#registration-status');
    const alignmentScore = document.querySelector('#alignment-score');
    const lesionIndicator = document.querySelector('#lesion-indicator');
    const alignmentGrid = document.querySelector('#alignment-grid');
    const cuttingPlanes = document.querySelector('#cutting-planes');
    const roiMarkers = document.querySelector('#roi-markers');
    
    if (!hologram) {
        console.error('Hologram element not found for reset');
        return;
    }
    
    hologram.setAttribute('visible', 'true');
    hologram.setAttribute('position', '0 0 -1');
    hologram.setAttribute('rotation', '0 0 0');
    hologram.setAttribute('scale', '1 1 1');
    hologram.removeAttribute('animation');
    hologram.removeAttribute('animation__rotation');
    hologram.removeAttribute('animation__scale');
    
    hologramVisible = true;
    registrationComplete = false;
    planesVisible = false;
    currentPosition = { x: 0, y: 0, z: -1 };
    currentRotation = { x: 0, y: 0, z: 0 };
    currentScale = 1;
    
    aiBtn.textContent = 'AI Registration';
    aiBtn.classList.remove('active');
    aiBtn.disabled = false;
    
    planesBtn.textContent = 'Show Cut Guidance';
    planesBtn.classList.remove('active');
    planesBtn.disabled = true;
    
    touchControls.style.display = 'block';
    
    statusText.setAttribute('value', 'MANUAL ALIGNMENT\nPosition over sample, then use AI Registration');
    statusText.setAttribute('color', '#00ff88');
    
    alignmentScore.textContent = 'Position hologram over sample, then run AI Registration';
    alignmentScore.className = '';
    
    lesionIndicator.setAttribute('visible', 'false');
    alignmentGrid.setAttribute('visible', 'true');
    cuttingPlanes.setAttribute('visible', 'false');
    roiMarkers.setAttribute('visible', 'false');
    
    updateStatus('Demo reset - Position hologram and run AI Registration');
}

function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log('Status:', message);
}

document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);