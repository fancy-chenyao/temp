/**
 * Christmas Theme Page - Main Entry Point
 * 圣诞节主题页面 - 主入口文件
 */

// ===========================
// Unified Error Handling System
// ===========================

/**
 * Error severity levels
 */
const ErrorSeverity = {
    LOW: 'low',           // Non-critical, doesn't affect core functionality
    MEDIUM: 'medium',     // Affects some features but app still usable
    HIGH: 'high',         // Critical error, major functionality broken
    FATAL: 'fatal'        // App cannot function
};

/**
 * Centralized error handler
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @param {string} severity - Error severity level
 */
function handleError(error, context, severity = ErrorSeverity.MEDIUM) {
    // Log error with context
    const errorInfo = {
        timestamp: new Date().toISOString(),
        context,
        severity,
        message: error.message,
        stack: error.stack
    };
    
    // Store error in app state
    if (ChristmasApp && ChristmasApp.errors) {
        ChristmasApp.errors.push(errorInfo);
    }
    
    // Log to console with appropriate level
    if (severity === ErrorSeverity.FATAL || severity === ErrorSeverity.HIGH) {
        console.error(`[${severity.toUpperCase()}] Error in ${context}:`, error);
    } else {
        console.warn(`[${severity.toUpperCase()}] Error in ${context}:`, error);
    }
    
    // Take action based on severity
    switch (severity) {
        case ErrorSeverity.FATAL:
            showFatalError(context, error.message);
            break;
        case ErrorSeverity.HIGH:
            showErrorNotification(context, error.message);
            break;
        case ErrorSeverity.MEDIUM:
            // Log only, app continues
            break;
        case ErrorSeverity.LOW:
            // Silent logging
            break;
    }
    
    return errorInfo;
}

/**
 * Show fatal error message to user
 * @param {string} context - Error context
 * @param {string} message - Error message
 */
function showFatalError(context, message) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'fatal-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(196, 30, 58, 0.95);
        color: white;
        padding: 30px 40px;
        border-radius: 12px;
        font-family: 'Raleway', sans-serif;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        z-index: 10001;
        max-width: 90%;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <h2 style="margin: 0 0 15px 0; font-size: 1.5rem;">❌ 严重错误 / Fatal Error</h2>
        <p style="margin: 0 0 10px 0; font-size: 1rem;">${context}</p>
        <p style="margin: 0 0 20px 0; font-size: 0.9rem; opacity: 0.9;">${message}</p>
        <button onclick="location.reload()" style="
            background: white;
            color: #C41E3A;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            font-family: 'Raleway', sans-serif;
            font-weight: 600;
        ">刷新页面 / Reload Page</button>
    `;
    document.body.appendChild(errorDiv);
}

/**
 * Show error notification to user
 * @param {string} context - Error context
 * @param {string} message - Error message
 */
function showErrorNotification(context, message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(196, 30, 58, 0.95);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Raleway', sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
    `;
    notification.innerHTML = `
        <strong>⚠️ ${context}</strong><br>
        <small>${message}</small>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Safe module initialization wrapper
 * @param {string} moduleName - Name of the module
 * @param {Function} initFunction - Initialization function
 * @param {string} severity - Error severity if initialization fails
 * @returns {boolean} True if initialization successful
 */
function safeInitModule(moduleName, initFunction, severity = ErrorSeverity.MEDIUM) {
    try {
        console.log(`Initializing ${moduleName}...`);
        ChristmasApp.moduleStatus[moduleName] = 'initializing';
        
        const result = initFunction();
        
        ChristmasApp.moduleStatus[moduleName] = 'initialized';
        console.log(`✓ ${moduleName} initialized successfully`);
        
        return result !== false;
    } catch (error) {
        ChristmasApp.moduleStatus[moduleName] = 'failed';
        handleError(error, `${moduleName} initialization`, severity);
        return false;
    }
}

/**
 * Get application health status
 * @returns {Object} Health status information
 */
function getAppHealth() {
    const totalModules = Object.keys(ChristmasApp.moduleStatus).length;
    const initializedModules = Object.values(ChristmasApp.moduleStatus)
        .filter(status => status === 'initialized').length;
    const failedModules = Object.values(ChristmasApp.moduleStatus)
        .filter(status => status === 'failed').length;
    
    return {
        healthy: failedModules === 0 && initializedModules === totalModules,
        totalModules,
        initializedModules,
        failedModules,
        moduleStatus: { ...ChristmasApp.moduleStatus },
        errors: ChristmasApp.errors.length,
        initialized: ChristmasApp.initialized
    };
}

// ===========================
// Performance Optimization Utilities
// ===========================

/**
 * Debounce function to limit function execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Request idle callback polyfill for better performance
 * @param {Function} callback - Callback to execute during idle time
 * @param {Object} options - Options object
 */
const requestIdleCallbackPolyfill = window.requestIdleCallback || function(callback, options) {
    const start = Date.now();
    return setTimeout(function() {
        callback({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};

/**
 * Lazy load non-critical resources during idle time
 */
function lazyLoadResources() {
    requestIdleCallbackPolyfill(() => {
        console.log('🔄 Lazy loading non-critical resources...');
        
        // Preload any additional resources here
        // For now, we'll just log that we're ready for lazy loading
        console.log('✓ Ready for lazy loading');
    });
}

/**
 * Optimize images and resources
 * This would typically involve checking for WebP support, lazy loading images, etc.
 */
function optimizeResources() {
    // Check for WebP support
    const supportsWebP = (function() {
        const elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    })();
    
    if (supportsWebP) {
        console.log('✓ WebP format supported');
    } else {
        console.log('ℹ️  WebP not supported, using fallback formats');
    }
    
    // Add will-change hints to animated elements for better performance
    const animatedElements = document.querySelectorAll('.tree-light, .tree-star, .gift-box, .star-decoration, .bell-decoration');
    animatedElements.forEach(element => {
        element.style.willChange = 'transform, opacity';
    });
    
    console.log(`✓ Optimized ${animatedElements.length} animated elements with will-change hints`);
}

/**
 * Monitor and log resource loading performance
 */
function monitorResourcePerformance() {
    if (!window.performance || !window.performance.getEntriesByType) {
        return;
    }
    
    const resources = window.performance.getEntriesByType('resource');
    let totalSize = 0;
    let totalDuration = 0;
    
    console.log('📦 Resource Loading Performance:');
    resources.forEach(resource => {
        if (resource.transferSize) {
            totalSize += resource.transferSize;
        }
        totalDuration += resource.duration;
        
        // Log slow resources (> 500ms)
        if (resource.duration > 500) {
            console.warn(`   ⚠️  Slow resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
        }
    });
    
    console.log(`   Total resources: ${resources.length}`);
    console.log(`   Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Average load time: ${(totalDuration / resources.length).toFixed(2)}ms`);
}

// ===========================
// Snowflake Class
// ===========================

/**
 * Represents a single snowflake particle
 */
class Snowflake {
    /**
     * Create a snowflake
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} radius - Snowflake radius (2-5px)
     * @param {number} speed - Fall speed (1-3px/frame)
     * @param {number} drift - Horizontal drift (-0.5 to 0.5px/frame)
     * @param {number} opacity - Opacity (0.3-0.8)
     */
    constructor(x, y, radius, speed, drift, opacity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.drift = drift;
        this.opacity = opacity;
    }

    /**
     * Update snowflake position
     */
    update() {
        this.y += this.speed;
        this.x += this.drift;
    }

    /**
     * Draw snowflake on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ===========================
// SnowflakeSystem Class
// ===========================

/**
 * Manages the snowflake particle system
 */
class SnowflakeSystem {
    /**
     * Create a snowflake system
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} particleCount - Number of particles
     */
    constructor(canvas, particleCount) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particleCount = particleCount;
        this.particles = [];
        this.animationId = null;
    }

    /**
     * Initialize the snowflake system
     */
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createSnowflake());
        }
    }

    /**
     * Create a random snowflake particle
     * @returns {Snowflake} A new snowflake instance
     */
    createSnowflake() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const radius = 2 + Math.random() * 3; // 2-5px
        const speed = 1 + Math.random() * 2; // 1-3px/frame
        const drift = -0.5 + Math.random(); // -0.5 to 0.5px/frame
        const opacity = 0.3 + Math.random() * 0.5; // 0.3-0.8
        
        return new Snowflake(x, y, radius, speed, drift, opacity);
    }

    /**
     * Update all snowflakes
     */
    update() {
        for (let particle of this.particles) {
            particle.update();
            
            // Reset snowflake if it goes below viewport
            if (particle.y > this.canvas.height) {
                particle.y = 0;
                particle.x = Math.random() * this.canvas.width;
            }
        }
    }

    /**
     * Render all snowflakes
     */
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }
    }

    /**
     * Resize the canvas and adjust particles
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * Set particle count
     * @param {number} count - New particle count
     */
    setParticleCount(count) {
        this.particleCount = count;
        this.init();
    }
}

// Global application state
const ChristmasApp = {
    // System components (to be initialized)
    snowflakeSystem: null,
    christmasElements: null,
    animationController: null,
    interactionHandler: null,
    audioController: null,
    responsiveManager: null,
    
    // Configuration
    config: {
        snowflakeCount: 100,
        animationFPS: 60,
        audioDefaultVolume: 0.5,
        audioDefaultMuted: false  // 改为 false，音乐默认播放
    },
    
    // Initialization flag
    initialized: false,
    
    // Error tracking
    errors: [],
    
    // Module status tracking
    moduleStatus: {
        snowflakeSystem: 'not_initialized',
        animationController: 'not_initialized',
        christmasElements: 'not_initialized',
        audioController: 'not_initialized',
        interactionHandler: 'not_initialized',
        responsiveManager: 'not_initialized'
    }
};

/**
 * Handle performance degradation by reducing animation complexity
 * @param {number} currentFPS - Current frames per second
 */
function handlePerformanceDegradation(currentFPS) {
    console.warn(`Performance degradation detected at ${currentFPS.toFixed(2)} FPS. Applying optimizations...`);
    
    // Strategy 1: Reduce snowflake particle count by 40%
    if (ChristmasApp.snowflakeSystem) {
        const currentCount = ChristmasApp.snowflakeSystem.particleCount;
        const reducedCount = Math.max(20, Math.floor(currentCount * 0.6)); // Reduce by 40%, minimum 20
        
        console.log(`Reducing snowflake count: ${currentCount} → ${reducedCount}`);
        ChristmasApp.snowflakeSystem.setParticleCount(reducedCount);
    }
    
    // Strategy 2: Disable non-critical animations (decorations)
    // Disable gift box animations
    const giftBoxes = document.querySelectorAll('.gift-box');
    giftBoxes.forEach(gift => {
        gift.style.animation = 'none';
    });
    
    // Disable star animations
    const stars = document.querySelectorAll('.star-decoration');
    stars.forEach(star => {
        star.style.animation = 'none';
    });
    
    // Disable bell animations
    const bells = document.querySelectorAll('.bell-decoration');
    bells.forEach(bell => {
        bell.style.animation = 'none';
    });
    
    console.log('Non-critical decoration animations disabled');
    
    // Strategy 3: Reduce tree light animation complexity
    const treeLights = document.querySelectorAll('.tree-light');
    treeLights.forEach(light => {
        // Simplify animation by removing it
        light.style.animation = 'none';
        // Keep static appearance
        light.style.opacity = '0.8';
    });
    
    console.log('Tree light animations simplified');
    
    // Show notification to user
    showPerformanceNotification();
}

/**
 * Show performance optimization notification to user
 */
function showPerformanceNotification() {
    // Check if notification already exists
    if (document.getElementById('performance-notification')) {
        return;
    }
    
    const notification = document.createElement('div');
    notification.id = 'performance-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 215, 0, 0.95);
        color: #333;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-family: 'Raleway', sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: fadeIn 0.5s ease-in;
    `;
    notification.textContent = '已优化动画以提升性能 / Animations optimized for better performance';
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
    const announcer = document.getElementById('sr-announcements');
    if (announcer) {
        announcer.textContent = message;
        
        // Clear after 1 second to allow for new announcements
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
}

/**
 * Initialize animation preference controls
 * Detects prefers-reduced-motion and provides manual toggle
 */
function initAnimationPreferences() {
    const animationToggle = document.getElementById('animationToggle');
    const animationIcon = animationToggle ? animationToggle.querySelector('.animation-icon') : null;
    
    if (!animationToggle) {
        console.warn('Animation toggle button not found');
        return;
    }
    
    // Check for prefers-reduced-motion media query
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Initialize state based on system preference or localStorage
    let isReducedMotion = prefersReducedMotion.matches;
    const savedPreference = localStorage.getItem('christmas-reduced-motion');
    
    if (savedPreference !== null) {
        isReducedMotion = savedPreference === 'true';
    }
    
    // Apply initial state
    applyAnimationPreference(isReducedMotion);
    updateAnimationIcon(animationIcon, isReducedMotion);
    
    // Listen for system preference changes
    prefersReducedMotion.addEventListener('change', (e) => {
        console.log('System animation preference changed:', e.matches ? 'reduced' : 'normal');
        const newState = e.matches;
        applyAnimationPreference(newState);
        updateAnimationIcon(animationIcon, newState);
        
        // Show notification
        showAnimationPreferenceNotification(newState);
    });
    
    // Add click event listener for manual toggle
    animationToggle.addEventListener('click', () => {
        isReducedMotion = !isReducedMotion;
        
        // Save preference to localStorage
        localStorage.setItem('christmas-reduced-motion', isReducedMotion.toString());
        
        // Apply new state
        applyAnimationPreference(isReducedMotion);
        updateAnimationIcon(animationIcon, isReducedMotion);
        
        // Show notification
        showAnimationPreferenceNotification(isReducedMotion);
        
        console.log('Animation preference manually toggled:', isReducedMotion ? 'reduced' : 'normal');
    });
    
    // Add keyboard accessibility
    animationToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            animationToggle.click();
        }
    });
    
    console.log('Animation preferences initialized:', isReducedMotion ? 'reduced motion' : 'normal animations');
}

/**
 * Apply animation preference (enable or disable animations)
 * @param {boolean} reduceAnimations - True to reduce animations
 */
function applyAnimationPreference(reduceAnimations) {
    if (reduceAnimations) {
        // Add reduced motion class to body
        document.body.classList.add('reduced-motion-mode');
        
        // Disable snowflake animations by reducing particle count significantly
        if (ChristmasApp.snowflakeSystem) {
            const currentCount = ChristmasApp.snowflakeSystem.particleCount;
            const reducedCount = Math.max(10, Math.floor(currentCount * 0.2)); // Reduce to 20%
            ChristmasApp.snowflakeSystem.setParticleCount(reducedCount);
            console.log(`Snowflake count reduced: ${currentCount} → ${reducedCount}`);
        }
        
        // Disable tree light animations
        const treeLights = document.querySelectorAll('.tree-light');
        treeLights.forEach(light => {
            light.style.animation = 'none';
            light.style.opacity = '0.8';
        });
        
        // Disable decoration animations
        const decorations = document.querySelectorAll('.gift-box, .star-decoration, .bell-decoration');
        decorations.forEach(decoration => {
            decoration.style.animation = 'none';
        });
        
        // Disable star twinkle
        const treeStar = document.querySelector('.tree-star');
        if (treeStar) {
            treeStar.style.animation = 'none';
        }
        
        console.log('Animations reduced for accessibility');
        
    } else {
        // Remove reduced motion class from body
        document.body.classList.remove('reduced-motion-mode');
        
        // Restore snowflake count
        if (ChristmasApp.snowflakeSystem && ChristmasApp.responsiveManager) {
            const normalCount = ChristmasApp.responsiveManager.getSnowflakeCount();
            ChristmasApp.snowflakeSystem.setParticleCount(normalCount);
            console.log(`Snowflake count restored: ${normalCount}`);
        }
        
        // Re-enable tree light animations
        const treeLights = document.querySelectorAll('.tree-light');
        treeLights.forEach(light => {
            light.style.animation = '';
        });
        
        // Re-enable decoration animations
        const decorations = document.querySelectorAll('.gift-box, .star-decoration, .bell-decoration');
        decorations.forEach(decoration => {
            decoration.style.animation = '';
        });
        
        // Re-enable star twinkle
        const treeStar = document.querySelector('.tree-star');
        if (treeStar) {
            treeStar.style.animation = '';
        }
        
        console.log('Normal animations restored');
    }
}

/**
 * Update animation toggle icon
 * @param {HTMLElement} iconElement - The icon element
 * @param {boolean} isReduced - True if reduced motion is active
 */
function updateAnimationIcon(iconElement, isReduced) {
    if (!iconElement) return;
    
    const button = iconElement.closest('.animation-button');
    
    if (isReduced) {
        iconElement.textContent = '⏸️'; // Pause icon for reduced motion
        button.classList.add('reduced-motion');
        button.setAttribute('aria-label', '启用动画 / Enable Animations');
        button.title = '启用动画 / Enable Animations';
    } else {
        iconElement.textContent = '🎬'; // Film icon for normal animations
        button.classList.remove('reduced-motion');
        button.setAttribute('aria-label', '减少动画 / Reduce Animations');
        button.title = '减少动画 / Reduce Animations';
    }
}

/**
 * Show animation preference change notification
 * @param {boolean} isReduced - True if reduced motion is active
 */
function showAnimationPreferenceNotification(isReduced) {
    // Announce to screen readers
    if (isReduced) {
        announceToScreenReader('动画已减少，为了更好的可访问性体验');
    } else {
        announceToScreenReader('动画已启用，完整的视觉体验');
    }
    
    // Check if notification already exists
    const existingNotification = document.getElementById('animation-preference-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'animation-preference-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(22, 91, 51, 0.95);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-family: 'Raleway', sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: fadeIn 0.5s ease-in;
        text-align: center;
    `;
    
    if (isReduced) {
        notification.innerHTML = `
            <strong>⏸️ 动画已减少 / Animations Reduced</strong><br>
            <small>为了更好的可访问性体验 / For better accessibility</small>
        `;
    } else {
        notification.innerHTML = `
            <strong>🎬 动画已启用 / Animations Enabled</strong><br>
            <small>完整的视觉体验 / Full visual experience</small>
        `;
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

/**
 * Initialize the application
 */

/**
 * Resize canvas to match window size
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Calculate appropriate particle count based on viewport size
 * @param {number} width - Viewport width
 * @param {number} height - Viewport height
 * @returns {number} Appropriate particle count
 */
function calculateParticleCount(width, height) {
    const area = width * height;
    const baseCount = 100; // Base count for desktop (1920x1080)
    const baseArea = 1920 * 1080;
    
    // Calculate proportional count
    let count = Math.floor((area / baseArea) * baseCount);
    
    // Reduce by 30% for small screens (< 768px width)
    if (width < 768) {
        count = Math.floor(count * 0.7);
    }
    
    // Ensure minimum and maximum bounds
    count = Math.max(30, Math.min(200, count));
    
    return count;
}

/**
 * Initialize audio controls
 */
function initAudioControls() {
    const audioToggle = document.getElementById('audioToggle');
    const volumeControl = document.getElementById('volumeControl');
    const audioIcon = audioToggle ? audioToggle.querySelector('.audio-icon') : null;
    
    if (!audioToggle || !volumeControl) {
        console.warn('Audio controls not found in DOM');
        return;
    }
    
    try {
        // Create audio controller
        // 使用本地音乐文件
        // 请确保项目根目录有 christmas-music.mp3 文件
        const audioSrc = 'christmas-music.mp3';
        ChristmasApp.audioController = new AudioController(audioSrc);
        const initSuccess = ChristmasApp.audioController.init();
        
        if (!initSuccess) {
            console.error('Audio controller initialization failed');
            // Hide controls if initialization failed
            const audioControls = document.getElementById('audioControls');
            if (audioControls) {
                audioControls.style.display = 'none';
            }
            return;
        }
        
        // Set initial volume from config
        volumeControl.value = ChristmasApp.config.audioDefaultVolume * 100;
        ChristmasApp.audioController.setVolume(ChristmasApp.config.audioDefaultVolume);
        
        // Set initial muted state from config
        ChristmasApp.audioController.setMuted(ChristmasApp.config.audioDefaultMuted);
        
        // Update icon based on initial state
        updateAudioIcon(audioIcon, ChristmasApp.audioController.getState());
        
        // Add click event listener for play/pause toggle
        audioToggle.addEventListener('click', async () => {
            try {
                // Check if audio has load error
                if (ChristmasApp.audioController.loadError) {
                    console.warn('Cannot play audio - load error occurred');
                    return;
                }
                
                const isNowPlaying = await ChristmasApp.audioController.toggle();
                
                // Update icon based on new state
                updateAudioIcon(audioIcon, ChristmasApp.audioController.getState());
                
                // Announce to screen readers
                announceToScreenReader(isNowPlaying ? '音乐正在播放' : '音乐已暂停');
                
                console.log(isNowPlaying ? 'Audio playing' : 'Audio paused');
            } catch (error) {
                console.error('Error toggling audio:', error);
                // Show error notification
                showAudioPlaybackError();
            }
        });
        
        // Add input event listener for volume control
        volumeControl.addEventListener('input', (e) => {
            try {
                const volumePercent = parseInt(e.target.value);
                const volumeLevel = volumePercent / 100; // Convert to 0-1 range
                
                ChristmasApp.audioController.setVolume(volumeLevel);
                
                // If volume is set above 0, unmute automatically
                if (volumeLevel > 0 && ChristmasApp.audioController.getState().isMuted) {
                    ChristmasApp.audioController.setMuted(false);
                    updateAudioIcon(audioIcon, ChristmasApp.audioController.getState());
                }
                
                // If volume is set to 0, mute
                if (volumeLevel === 0 && !ChristmasApp.audioController.getState().isMuted) {
                    ChristmasApp.audioController.setMuted(true);
                    updateAudioIcon(audioIcon, ChristmasApp.audioController.getState());
                }
                
                console.log('Volume set to:', volumePercent + '%');
            } catch (error) {
                console.error('Error adjusting volume:', error);
            }
        });
        
        // Add keyboard accessibility for audio toggle
        audioToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                audioToggle.click();
            }
        });
        
        console.log('Audio controls initialized successfully');
        
        // 自动播放音乐策略
        if (!ChristmasApp.config.audioDefaultMuted) {
            // 策略1: 立即尝试自动播放
            setTimeout(async () => {
                try {
                    const played = await ChristmasApp.audioController.play();
                    if (played) {
                        updateAudioIcon(audioIcon, ChristmasApp.audioController.getState());
                        console.log('✓ Audio auto-play started immediately');
                        return; // 成功播放，不需要后续策略
                    }
                } catch (error) {
                    console.log('ℹ️ Immediate auto-play blocked, trying interaction-based approach...');
                }
                
                // 策略2: 如果立即播放失败，在用户首次交互时播放
                const autoPlayOnInteraction = async () => {
                    try {
                        const played = await ChristmasApp.audioController.play();
                        if (played) {
                            updateAudioIcon(audioIcon, ChristmasApp.audioController.getState());
                            console.log('✓ Audio started on user interaction');
                            
                            // 移除所有事件监听器
                            document.removeEventListener('click', autoPlayOnInteraction);
                            document.removeEventListener('keydown', autoPlayOnInteraction);
                            document.removeEventListener('touchstart', autoPlayOnInteraction);
                            document.removeEventListener('mousemove', autoPlayOnInteraction);
                            document.removeEventListener('scroll', autoPlayOnInteraction);
                        }
                    } catch (error) {
                        console.log('ℹ️ Audio playback failed:', error.message);
                    }
                };
                
                // 监听多种用户交互事件
                document.addEventListener('click', autoPlayOnInteraction, { once: true });
                document.addEventListener('keydown', autoPlayOnInteraction, { once: true });
                document.addEventListener('touchstart', autoPlayOnInteraction, { once: true });
                document.addEventListener('mousemove', autoPlayOnInteraction, { once: true });
                document.addEventListener('scroll', autoPlayOnInteraction, { once: true });
                
                console.log('ℹ️ Audio will auto-play on first user interaction (click, move, scroll, etc.)');
            }, 100);
        }
        
    } catch (error) {
        console.error('Error initializing audio controls:', error);
        // Hide controls on error
        const audioControls = document.getElementById('audioControls');
        if (audioControls) {
            audioControls.style.display = 'none';
        }
    }
}

/**
 * Show audio playback error notification
 */
function showAudioPlaybackError() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: rgba(196, 30, 58, 0.95);
        color: white;
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-family: 'Raleway', sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: fadeIn 0.3s ease-in;
    `;
    notification.textContent = '音频播放失败 / Audio playback failed';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Update audio icon based on audio state
 * @param {HTMLElement} iconElement - The icon element to update
 * @param {Object} audioState - Current audio state
 */
function updateAudioIcon(iconElement, audioState) {
    if (!iconElement) return;
    
    // Update icon based on playing and muted state
    if (audioState.isPlaying && !audioState.isMuted) {
        iconElement.textContent = '🔊'; // Playing with sound
    } else if (audioState.isPlaying && audioState.isMuted) {
        iconElement.textContent = '🔇'; // Playing but muted
    } else if (!audioState.isPlaying && !audioState.isMuted) {
        iconElement.textContent = '🔈'; // Paused with sound available
    } else {
        iconElement.textContent = '🔇'; // Paused and muted (default)
    }
}

/**
 * Initialize Christmas tree lights
 */
function initChristmasTreeLights() {
    const treeContainer = document.getElementById('christmasTree');
    if (!treeContainer) {
        console.warn('Christmas tree container not found');
        return;
    }
    
    // Define light colors
    const lightColors = [
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#FFFF00', // Yellow
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#FFD700', // Gold
        '#FFFFFF'  // White
    ];
    
    // Define light positions (relative to tree layers)
    const lightPositions = [
        // Top layer
        { layer: 'top', x: -20, y: 40 },
        { layer: 'top', x: 20, y: 40 },
        { layer: 'top', x: 0, y: 60 },
        
        // Middle layer
        { layer: 'middle', x: -40, y: 50 },
        { layer: 'middle', x: 40, y: 50 },
        { layer: 'middle', x: -20, y: 80 },
        { layer: 'middle', x: 20, y: 80 },
        { layer: 'middle', x: 0, y: 100 },
        
        // Bottom layer
        { layer: 'bottom', x: -60, y: 60 },
        { layer: 'bottom', x: 60, y: 60 },
        { layer: 'bottom', x: -40, y: 100 },
        { layer: 'bottom', x: 40, y: 100 },
        { layer: 'bottom', x: -20, y: 130 },
        { layer: 'bottom', x: 20, y: 130 },
        { layer: 'bottom', x: 0, y: 150 }
    ];
    
    // Create lights
    lightPositions.forEach((pos, index) => {
        const light = document.createElement('div');
        light.className = 'tree-light';
        light.dataset.layer = pos.layer;
        light.setAttribute('aria-hidden', 'true'); // Decorative element
        
        // Assign random color
        const color = lightColors[Math.floor(Math.random() * lightColors.length)];
        light.style.backgroundColor = color;
        light.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
        
        // Position the light
        light.style.left = `calc(50% + ${pos.x}px)`;
        light.style.top = `${pos.y}px`;
        
        // Add random animation delay (0-2 seconds)
        const randomDelay = Math.random() * 2;
        light.style.animationDelay = `${randomDelay}s`;
        
        // Randomize animation duration slightly (1-2 seconds)
        const randomDuration = 1 + Math.random();
        light.style.animationDuration = `${randomDuration}s`;
        
        // Add to tree container
        const layerElement = treeContainer.querySelector(`.tree-${pos.layer}`);
        if (layerElement) {
            layerElement.appendChild(light);
        }
    });
    
    console.log(`Created ${lightPositions.length} Christmas tree lights`);
}

/**
 * Create a gift box element
 * @param {number} x - X position (percentage)
 * @param {number} y - Y position (percentage)
 * @returns {HTMLElement} Gift box element
 */
function createGiftBox(x, y) {
    const giftBox = document.createElement('div');
    giftBox.className = 'gift-box';
    giftBox.style.left = `${x}%`;
    giftBox.style.top = `${y}%`;
    giftBox.setAttribute('role', 'button');
    giftBox.setAttribute('tabindex', '0');
    giftBox.setAttribute('aria-label', '礼物盒 - 点击打开');
    
    // Add random animation delay and duration
    const randomDelay = Math.random() * 2;
    const randomDuration = 2 + Math.random() * 1.5; // 2-3.5 seconds
    giftBox.style.animationDelay = `${randomDelay}s`;
    giftBox.style.animationDuration = `${randomDuration}s`;
    
    const body = document.createElement('div');
    body.className = 'gift-box-body';
    
    const ribbonV = document.createElement('div');
    ribbonV.className = 'gift-box-ribbon-v';
    
    const ribbonH = document.createElement('div');
    ribbonH.className = 'gift-box-ribbon-h';
    
    body.appendChild(ribbonV);
    body.appendChild(ribbonH);
    
    const lid = document.createElement('div');
    lid.className = 'gift-box-lid';
    
    const bow = document.createElement('div');
    bow.className = 'gift-box-bow';
    bow.textContent = '🎀';
    
    giftBox.appendChild(lid);
    giftBox.appendChild(body);
    giftBox.appendChild(bow);
    
    return giftBox;
}

/**
 * Create a star decoration element
 * @param {number} x - X position (percentage)
 * @param {number} y - Y position (percentage)
 * @returns {HTMLElement} Star element
 */
function createStar(x, y) {
    const star = document.createElement('div');
    star.className = 'star-decoration';
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.textContent = '⭐';
    star.setAttribute('role', 'button');
    star.setAttribute('tabindex', '0');
    star.setAttribute('aria-label', '星星装饰 - 点击互动');
    
    // Add random animation delay and duration
    const randomDelay = Math.random() * 2;
    const randomDuration = 2.5 + Math.random() * 1.5; // 2.5-4 seconds
    star.style.animationDelay = `${randomDelay}s`;
    star.style.animationDuration = `${randomDuration}s`;
    
    return star;
}

/**
 * Create a bell decoration element
 * @param {number} x - X position (percentage)
 * @param {number} y - Y position (percentage)
 * @returns {HTMLElement} Bell element
 */
function createBell(x, y) {
    const bell = document.createElement('div');
    bell.className = 'bell-decoration';
    bell.style.left = `${x}%`;
    bell.style.top = `${y}%`;
    bell.setAttribute('role', 'button');
    bell.setAttribute('tabindex', '0');
    bell.setAttribute('aria-label', '铃铛装饰 - 点击互动');
    
    // Add random animation delay and duration
    const randomDelay = Math.random() * 2;
    const randomDuration = 1.5 + Math.random() * 1; // 1.5-2.5 seconds
    bell.style.animationDelay = `${randomDelay}s`;
    bell.style.animationDuration = `${randomDuration}s`;
    
    const body = document.createElement('div');
    body.className = 'bell-body';
    
    const top = document.createElement('div');
    top.className = 'bell-top';
    
    const clapper = document.createElement('div');
    clapper.className = 'bell-clapper';
    
    const ribbon = document.createElement('div');
    ribbon.className = 'bell-ribbon';
    
    body.appendChild(top);
    body.appendChild(clapper);
    bell.appendChild(ribbon);
    bell.appendChild(body);
    
    return bell;
}

/**
 * Initialize Christmas decorations
 * Creates and positions gift boxes, stars, and bells
 */
function initChristmasDecorations() {
    const decorationsContainer = document.getElementById('decorations');
    if (!decorationsContainer) {
        console.warn('Decorations container not found');
        return;
    }
    
    // Clear existing decorations
    decorationsContainer.innerHTML = '';
    
    // Determine number of decorations based on screen size
    const screenWidth = window.innerWidth;
    let decorationCounts = {
        gifts: 6,
        stars: 8,
        bells: 6
    };
    
    // Adjust for tablet
    if (screenWidth < 1024 && screenWidth >= 768) {
        decorationCounts = {
            gifts: 4,
            stars: 6,
            bells: 4
        };
    }
    
    // Adjust for mobile
    if (screenWidth < 768) {
        decorationCounts = {
            gifts: 3,
            stars: 4,
            bells: 3
        };
    }
    
    // Define safe zones to avoid overlapping with main content
    // Center area is reserved for tree and greeting text
    const safeZones = [
        { xMin: 5, xMax: 25, yMin: 10, yMax: 90 },   // Left side
        { xMin: 75, xMax: 95, yMin: 10, yMax: 90 },  // Right side
        { xMin: 25, xMax: 75, yMin: 5, yMax: 15 },   // Top
        { xMin: 25, xMax: 75, yMin: 85, yMax: 95 }   // Bottom
    ];
    
    /**
     * Get random position within safe zones
     * @returns {{x: number, y: number}} Position object
     */
    function getRandomPosition() {
        const zone = safeZones[Math.floor(Math.random() * safeZones.length)];
        const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin);
        const y = zone.yMin + Math.random() * (zone.yMax - zone.yMin);
        return { x, y };
    }
    
    // Create gift boxes
    for (let i = 0; i < decorationCounts.gifts; i++) {
        const pos = getRandomPosition();
        const gift = createGiftBox(pos.x, pos.y);
        decorationsContainer.appendChild(gift);
    }
    
    // Create stars
    for (let i = 0; i < decorationCounts.stars; i++) {
        const pos = getRandomPosition();
        const star = createStar(pos.x, pos.y);
        decorationsContainer.appendChild(star);
    }
    
    // Create bells
    for (let i = 0; i < decorationCounts.bells; i++) {
        const pos = getRandomPosition();
        const bell = createBell(pos.x, pos.y);
        decorationsContainer.appendChild(bell);
    }
    
    const totalDecorations = decorationCounts.gifts + decorationCounts.stars + decorationCounts.bells;
    console.log(`Created ${totalDecorations} Christmas decorations (${decorationCounts.gifts} gifts, ${decorationCounts.stars} stars, ${decorationCounts.bells} bells)`);
}

/**
 * Initialize interaction handler for Christmas elements
 */
function initInteractionHandler() {
    // Get all interactive elements
    const giftBoxes = document.querySelectorAll('.gift-box');
    const stars = document.querySelectorAll('.star-decoration');
    const bells = document.querySelectorAll('.bell-decoration');
    
    // Combine all interactive elements
    const interactiveElements = [...giftBoxes, ...stars, ...bells];
    
    // Create interaction handler
    ChristmasApp.interactionHandler = new InteractionHandler(interactiveElements);
    
    // Mark elements as interactive
    interactiveElements.forEach(element => {
        ChristmasApp.interactionHandler.addElement(element);
    });
    
    // Attach hover effects
    ChristmasApp.interactionHandler.attachHoverEffects();
    
    // Attach click effects with custom handler for gift boxes
    ChristmasApp.interactionHandler.attachClickEffects((element, event) => {
        // Special handling for gift boxes
        if (element.classList.contains('gift-box')) {
            ChristmasApp.interactionHandler.handleGiftClick(element);
        }
    });
    
    console.log(`Initialized interaction handler with ${interactiveElements.length} interactive elements`);
}

/**
 * Initialize responsive manager
 */
function initResponsiveManager() {
    // Create responsive manager
    ChristmasApp.responsiveManager = new ResponsiveManager();
    ChristmasApp.responsiveManager.init();
    
    // Register resize listener for responsive adjustments
    ChristmasApp.responsiveManager.onResize((resizeInfo) => {
        handleResponsiveAdjustments(resizeInfo);
    });
    
    // Apply initial responsive adjustments
    const initialConfig = ChristmasApp.responsiveManager.getResponsiveConfig();
    applyResponsiveStyles(initialConfig);
    
    console.log('Responsive manager initialized');
}

/**
 * Handle responsive adjustments when viewport changes
 * @param {Object} resizeInfo - Information about the resize event
 */
function handleResponsiveAdjustments(resizeInfo) {
    console.log('Handling responsive adjustments:', resizeInfo);
    
    // Get new responsive configuration
    const config = ChristmasApp.responsiveManager.getResponsiveConfig();
    
    // Apply responsive styles
    applyResponsiveStyles(config);
    
    // Adjust snowflake count if needed
    if (ChristmasApp.snowflakeSystem) {
        const currentCount = ChristmasApp.snowflakeSystem.particleCount;
        const newCount = config.snowflakeCount;
        
        if (currentCount !== newCount) {
            console.log(`Adjusting snowflake count: ${currentCount} → ${newCount}`);
            ChristmasApp.snowflakeSystem.setParticleCount(newCount);
        }
    }
    
    // Recreate decorations if device type changed
    if (resizeInfo.deviceChanged) {
        console.log('Device type changed, recreating decorations');
        initChristmasDecorations();
        
        // Reinitialize interaction handler with new elements
        initInteractionHandler();
    }
}

/**
 * Apply responsive styles to elements
 * @param {Object} config - Responsive configuration
 */
function applyResponsiveStyles(config) {
    // Adjust greeting text size
    const greetingPrimary = document.querySelector('.greeting-primary');
    const greetingSecondary = document.querySelector('.greeting-secondary');
    
    if (greetingPrimary) {
        greetingPrimary.style.fontSize = config.fontSize.primary;
    }
    
    if (greetingSecondary) {
        greetingSecondary.style.fontSize = config.fontSize.secondary;
    }
    
    // Adjust Christmas tree height
    const christmasTree = document.getElementById('christmasTree');
    if (christmasTree) {
        christmasTree.style.height = config.treeHeight;
    }
    
    // Ensure core elements are visible
    ensureCoreElementsVisible();
    
    // Apply smooth transitions
    applyTransitionStyles();
}

/**
 * Ensure core elements remain visible in viewport
 */
function ensureCoreElementsVisible() {
    const coreElements = [
        document.querySelector('.greeting-text'),
        document.getElementById('christmasTree'),
        document.getElementById('audioControls')
    ];
    
    coreElements.forEach(element => {
        if (element) {
            // Check if element is in viewport
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Element is considered visible if any part is in viewport
            const isVisible = (
                rect.top < viewportHeight &&
                rect.bottom > 0 &&
                rect.left < viewportWidth &&
                rect.right > 0
            );
            
            if (!isVisible) {
                console.warn('Core element not fully visible:', element);
                // Could add logic here to adjust positioning if needed
            }
        }
    });
}

/**
 * Apply smooth transition styles for responsive changes
 */
function applyTransitionStyles() {
    const transitionElements = [
        document.querySelector('.greeting-primary'),
        document.querySelector('.greeting-secondary'),
        document.getElementById('christmasTree')
    ];
    
    transitionElements.forEach(element => {
        if (element && !element.style.transition) {
            element.style.transition = 'all 0.3s ease';
        }
    });
}

/**
 * Handle Canvas not supported scenario
 * Implements CSS fallback animations for snowflakes
 */
function handleCanvasNotSupported() {
    console.log('Canvas not supported - Applying CSS fallback for animations');
    document.body.classList.add('no-canvas-support');
    
    // Hide the canvas element
    const canvas = document.getElementById('snowCanvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
    
    // Create CSS-based snowflakes as fallback
    createCSSSnowflakes();
    
    // Display friendly message
    const message = document.createElement('div');
    message.id = 'canvas-fallback-message';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 215, 0, 0.95);
        color: #333;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-family: 'Raleway', sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: fadeIn 0.5s ease-in;
        text-align: center;
        max-width: 90%;
    `;
    message.innerHTML = `
        <strong>提示 / Notice</strong><br>
        您的浏览器不支持 Canvas，使用 CSS 动画替代<br>
        Canvas not supported, using CSS animations instead
    `;
    document.body.appendChild(message);
    
    // Remove message after 6 seconds
    setTimeout(() => {
        message.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            message.remove();
        }, 500);
    }, 6000);
}

/**
 * Create CSS-based snowflakes as fallback when Canvas is not supported
 */
function createCSSSnowflakes() {
    console.log('Creating CSS-based snowflakes as fallback');
    
    // Create container for CSS snowflakes
    const snowContainer = document.createElement('div');
    snowContainer.id = 'css-snowflakes';
    snowContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    
    // Determine number of snowflakes based on screen size
    const screenWidth = window.innerWidth;
    let snowflakeCount = 50; // Default for desktop
    
    if (screenWidth < 768) {
        snowflakeCount = 30; // Mobile
    } else if (screenWidth < 1024) {
        snowflakeCount = 40; // Tablet
    }
    
    // Create individual CSS snowflakes
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'css-snowflake';
        snowflake.textContent = '❄';
        
        // Random properties
        const size = 10 + Math.random() * 20; // 10-30px
        const startX = Math.random() * 100; // 0-100%
        const duration = 5 + Math.random() * 10; // 5-15 seconds
        const delay = Math.random() * 5; // 0-5 seconds delay
        const drift = -20 + Math.random() * 40; // -20 to 20px horizontal drift
        const opacity = 0.3 + Math.random() * 0.5; // 0.3-0.8
        
        snowflake.style.cssText = `
            position: absolute;
            top: -50px;
            left: ${startX}%;
            font-size: ${size}px;
            color: white;
            opacity: ${opacity};
            animation: cssSnowfall ${duration}s linear ${delay}s infinite;
            animation-fill-mode: both;
            user-select: none;
            pointer-events: none;
        `;
        
        // Add custom property for drift
        snowflake.style.setProperty('--drift', `${drift}px`);
        
        snowContainer.appendChild(snowflake);
    }
    
    // Add CSS animation keyframes if not already present
    if (!document.getElementById('css-snowflake-styles')) {
        const style = document.createElement('style');
        style.id = 'css-snowflake-styles';
        style.textContent = `
            @keyframes cssSnowfall {
                0% {
                    transform: translateY(0) translateX(0);
                }
                100% {
                    transform: translateY(100vh) translateX(var(--drift, 0));
                }
            }
            
            .css-snowflake {
                will-change: transform;
                backface-visibility: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add container to body
    document.body.insertBefore(snowContainer, document.body.firstChild);
    
    console.log(`Created ${snowflakeCount} CSS snowflakes as fallback`);
}

/**
 * Handle initialization errors
 * @param {Error} error - The error object
 */
function handleInitializationError(error) {
    console.error('Failed to initialize application:', error);
    
    // Display error message to user
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(196, 30, 58, 0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        font-size: 16px;
        text-align: center;
        z-index: 1000;
        max-width: 80%;
    `;
    errorMessage.innerHTML = `
        <h3 style="margin-bottom: 10px;">初始化失败</h3>
        <p>页面加载遇到问题，请刷新页面重试</p>
    `;
    document.body.appendChild(errorMessage);
}

// ===========================
// InteractionHandler Class
// ===========================

/**
 * Manages user interactions with Christmas elements using event delegation
 */
class InteractionHandler {
    /**
     * Create an interaction handler
     * @param {HTMLElement[]} elements - Array of interactive elements
     */
    constructor(elements = []) {
        this.elements = elements;
        this.eventListeners = new Map(); // Track event listeners for cleanup
        this.useEventDelegation = true; // Use event delegation for better performance
        this.delegationContainer = null;
    }

    /**
     * Add an element to the interaction handler
     * @param {HTMLElement} element - Element to add
     */
    addElement(element) {
        if (!this.elements.includes(element)) {
            this.elements.push(element);
            // Mark as interactive
            element.classList.add('interactive');
            element.setAttribute('data-interactive', 'true');
        }
    }

    /**
     * Remove an element from the interaction handler
     * @param {HTMLElement} element - Element to remove
     */
    removeElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
            element.classList.remove('interactive');
            element.removeAttribute('data-interactive');
            this.removeEventListeners(element);
        }
    }

    /**
     * Attach hover effects using event delegation for better performance
     */
    attachHoverEffects() {
        if (this.useEventDelegation) {
            // Use event delegation on document for better performance
            this.delegationContainer = document.body;
            
            const mouseEnterHandler = (e) => {
                const target = e.target.closest('[data-interactive="true"]');
                if (target && this.elements.includes(target)) {
                    target.classList.add('hovered');
                }
            };
            
            const mouseLeaveHandler = (e) => {
                const target = e.target.closest('[data-interactive="true"]');
                if (target && this.elements.includes(target)) {
                    target.classList.remove('hovered');
                }
            };
            
            this.delegationContainer.addEventListener('mouseenter', mouseEnterHandler, true);
            this.delegationContainer.addEventListener('mouseleave', mouseLeaveHandler, true);
            
            // Store delegation listeners for cleanup
            if (!this.eventListeners.has(this.delegationContainer)) {
                this.eventListeners.set(this.delegationContainer, []);
            }
            this.eventListeners.get(this.delegationContainer).push(
                { type: 'mouseenter', handler: mouseEnterHandler, capture: true },
                { type: 'mouseleave', handler: mouseLeaveHandler, capture: true }
            );
        } else {
            // Fallback to individual listeners
            this.elements.forEach(element => {
                const mouseEnterHandler = () => {
                    element.classList.add('hovered');
                };
                
                const mouseLeaveHandler = () => {
                    element.classList.remove('hovered');
                };
                
                element.addEventListener('mouseenter', mouseEnterHandler);
                element.addEventListener('mouseleave', mouseLeaveHandler);
                
                // Store listeners for cleanup
                if (!this.eventListeners.has(element)) {
                    this.eventListeners.set(element, []);
                }
                this.eventListeners.get(element).push(
                    { type: 'mouseenter', handler: mouseEnterHandler },
                    { type: 'mouseleave', handler: mouseLeaveHandler }
                );
            });
        }
    }

    /**
     * Attach click effects using event delegation for better performance
     * @param {Function} customHandler - Optional custom click handler
     */
    attachClickEffects(customHandler = null) {
        if (this.useEventDelegation) {
            // Use event delegation on document for better performance
            this.delegationContainer = document.body;
            
            const clickHandler = (e) => {
                const target = e.target.closest('[data-interactive="true"]');
                if (target && this.elements.includes(target)) {
                    // Add clicked class for animation
                    target.classList.add('clicked');
                    
                    // Remove clicked class after animation
                    setTimeout(() => {
                        target.classList.remove('clicked');
                    }, 600);
                    
                    // Call custom handler if provided
                    if (customHandler && typeof customHandler === 'function') {
                        customHandler(target, e);
                    }
                }
            };
            
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const target = e.target.closest('[data-interactive="true"]');
                    if (target && this.elements.includes(target)) {
                        e.preventDefault();
                        clickHandler(e);
                    }
                }
            };
            
            this.delegationContainer.addEventListener('click', clickHandler);
            this.delegationContainer.addEventListener('keydown', keyHandler);
            
            // Store delegation listeners for cleanup
            if (!this.eventListeners.has(this.delegationContainer)) {
                this.eventListeners.set(this.delegationContainer, []);
            }
            this.eventListeners.get(this.delegationContainer).push(
                { type: 'click', handler: clickHandler },
                { type: 'keydown', handler: keyHandler }
            );
        } else {
            // Fallback to individual listeners
            this.elements.forEach(element => {
                const clickHandler = (event) => {
                    // Add clicked class for animation
                    element.classList.add('clicked');
                    
                    // Remove clicked class after animation
                    setTimeout(() => {
                        element.classList.remove('clicked');
                    }, 600);
                    
                    // Call custom handler if provided
                    if (customHandler && typeof customHandler === 'function') {
                        customHandler(element, event);
                    }
                };
                
                element.addEventListener('click', clickHandler);
                
                // Keyboard accessibility (Enter and Space keys)
                const keyHandler = (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        clickHandler(event);
                    }
                };
                
                element.addEventListener('keydown', keyHandler);
                
                // Store listeners for cleanup
                if (!this.eventListeners.has(element)) {
                    this.eventListeners.set(element, []);
                }
                this.eventListeners.get(element).push(
                    { type: 'click', handler: clickHandler },
                    { type: 'keydown', handler: keyHandler }
                );
            });
        }
    }

    /**
     * Handle gift box click with special animation
     * @param {HTMLElement} gift - Gift box element
     */
    handleGiftClick(gift) {
        // Add opening animation class
        gift.classList.add('gift-opening');
        
        // Announce to screen readers
        if (typeof announceToScreenReader === 'function') {
            announceToScreenReader('礼物盒已打开，惊喜！');
        }
        
        // Show surprise content after animation
        setTimeout(() => {
            this.showSurprise(gift);
        }, 800);
    }

    /**
     * Show surprise content when gift is opened
     * @param {HTMLElement} gift - Gift box element
     */
    showSurprise(gift) {
        // Create surprise element
        const surprise = document.createElement('div');
        surprise.className = 'gift-surprise';
        surprise.innerHTML = '🎉';
        surprise.style.position = 'absolute';
        surprise.style.fontSize = '3rem';
        surprise.style.left = '50%';
        surprise.style.top = '50%';
        surprise.style.transform = 'translate(-50%, -50%)';
        surprise.style.animation = 'surprisePop 1s ease-out forwards';
        surprise.style.pointerEvents = 'none';
        surprise.style.zIndex = '1000';
        
        gift.appendChild(surprise);
        
        // Remove surprise after animation
        setTimeout(() => {
            surprise.remove();
            gift.classList.remove('gift-opening');
        }, 1000);
    }

    /**
     * Remove all event listeners from an element
     * @param {HTMLElement} element - Element to clean up
     */
    removeEventListeners(element) {
        const listeners = this.eventListeners.get(element);
        if (listeners) {
            listeners.forEach(({ type, handler, capture }) => {
                element.removeEventListener(type, handler, capture);
            });
            this.eventListeners.delete(element);
        }
    }

    /**
     * Clean up all event listeners
     */
    destroy() {
        // Clean up delegation listeners
        if (this.delegationContainer) {
            const listeners = this.eventListeners.get(this.delegationContainer);
            if (listeners) {
                listeners.forEach(({ type, handler, capture }) => {
                    this.delegationContainer.removeEventListener(type, handler, capture);
                });
                this.eventListeners.delete(this.delegationContainer);
            }
        }
        
        // Clean up individual element listeners
        this.elements.forEach(element => {
            this.removeEventListeners(element);
        });
        
        this.elements = [];
    }
}

// ===========================
// AudioController Class
// ===========================

/**
 * Manages background music playback and volume control
 */
class AudioController {
    /**
     * Create an audio controller
     * @param {string} audioSrc - Path to audio file (optional)
     */
    constructor(audioSrc = null) {
        this.audioSrc = audioSrc;
        this.audio = null;
        this.isPlaying = false;
        this.isMuted = true; // Default muted state as per requirements
        this.volume = 0.5; // Default volume (0-1)
        this.isInitialized = false;
        this.loadError = false;
    }

    /**
     * Initialize the audio element
     * @returns {boolean} True if initialization successful
     */
    init() {
        try {
            // Create audio element
            this.audio = new Audio();
            
            // Set default properties
            this.audio.loop = true; // Loop the Christmas music
            this.audio.volume = this.volume;
            this.audio.muted = this.isMuted;
            
            // Set source if provided
            if (this.audioSrc) {
                this.audio.src = this.audioSrc;
            }
            
            // Add error event listener
            this.audio.addEventListener('error', (e) => {
                console.error('Audio loading error:', e);
                this.loadError = true;
                this.handleLoadError();
            });
            
            // Add loaded event listener
            this.audio.addEventListener('canplaythrough', () => {
                console.log('Audio loaded successfully');
                this.isInitialized = true;
            });
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            this.loadError = true;
            this.handleLoadError();
            return false;
        }
    }

    /**
     * Play the audio
     * @returns {Promise<boolean>} True if play successful
     */
    async play() {
        if (!this.audio || this.loadError) {
            console.warn('Audio not available');
            return false;
        }

        try {
            // Unmute if muted
            if (this.isMuted) {
                this.audio.muted = false;
                this.isMuted = false;
            }
            
            await this.audio.play();
            this.isPlaying = true;
            return true;
            
        } catch (error) {
            console.error('Failed to play audio:', error);
            return false;
        }
    }

    /**
     * Pause the audio
     */
    pause() {
        if (!this.audio || this.loadError) {
            console.warn('Audio not available');
            return;
        }

        try {
            this.audio.pause();
            this.isPlaying = false;
        } catch (error) {
            console.error('Failed to pause audio:', error);
        }
    }

    /**
     * Toggle play/pause
     * @returns {Promise<boolean>} True if now playing, false if paused
     */
    async toggle() {
        if (this.isPlaying) {
            this.pause();
            return false;
        } else {
            await this.play();
            return true;
        }
    }

    /**
     * Set volume level
     * @param {number} level - Volume level (0-1)
     */
    setVolume(level) {
        if (!this.audio || this.loadError) {
            console.warn('Audio not available');
            return;
        }

        // Clamp volume between 0 and 1
        this.volume = Math.max(0, Math.min(1, level));
        this.audio.volume = this.volume;
    }

    /**
     * Mute/unmute audio
     * @param {boolean} muted - True to mute, false to unmute
     */
    setMuted(muted) {
        if (!this.audio || this.loadError) {
            console.warn('Audio not available');
            return;
        }

        this.isMuted = muted;
        this.audio.muted = muted;
    }

    /**
     * Get current audio state
     * @returns {Object} Audio state object
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            isMuted: this.isMuted,
            volume: this.volume,
            currentTime: this.audio ? this.audio.currentTime : 0,
            duration: this.audio ? this.audio.duration : 0,
            isInitialized: this.isInitialized,
            loadError: this.loadError
        };
    }

    /**
     * Handle audio load error
     * Hides audio controls and logs error as per requirements
     */
    handleLoadError() {
        console.error('Audio failed to load - hiding audio controls');
        
        // Log detailed error information
        if (this.audio && this.audio.error) {
            const errorCode = this.audio.error.code;
            const errorMessages = {
                1: 'MEDIA_ERR_ABORTED - Audio loading was aborted',
                2: 'MEDIA_ERR_NETWORK - Network error while loading audio',
                3: 'MEDIA_ERR_DECODE - Audio decoding failed',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Audio format not supported'
            };
            console.error(`Audio Error Code ${errorCode}: ${errorMessages[errorCode] || 'Unknown error'}`);
        }
        
        // Hide audio controls if they exist
        const audioControls = document.getElementById('audioControls');
        if (audioControls) {
            audioControls.style.display = 'none';
            console.log('Audio controls hidden due to load error');
        }
        
        // Show user-friendly notification
        this.showAudioErrorNotification();
    }
    
    /**
     * Show audio error notification to user
     */
    showAudioErrorNotification() {
        // Check if notification already exists
        if (document.getElementById('audio-error-notification')) {
            return;
        }
        
        const notification = document.createElement('div');
        notification.id = 'audio-error-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(196, 30, 58, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-family: 'Raleway', sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: fadeIn 0.5s ease-in;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <strong>🔇 音频不可用 / Audio Unavailable</strong><br>
            <small>背景音乐加载失败 / Background music failed to load</small>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    /**
     * Clean up audio resources
     */
    destroy() {
        if (this.audio) {
            this.pause();
            this.audio.src = '';
            this.audio = null;
        }
        this.isInitialized = false;
    }
}

// ===========================
// Color Contrast Utility Functions
// ===========================

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string (e.g., '#FFFFFF' or '#FFF')
 * @returns {{r: number, g: number, b: number}} RGB object
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Handle 3-digit hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 * @param {{r: number, g: number, b: number}} rgb - RGB color object
 * @returns {number} Relative luminance (0-1)
 */
function getRelativeLuminance(rgb) {
    // Normalize RGB values to 0-1
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;
    
    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.0 formula
 * @param {string} color1 - First color (hex format)
 * @param {string} color2 - Second color (hex format)
 * @returns {number} Contrast ratio (1-21)
 */
function calculateContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const lum1 = getRelativeLuminance(rgb1);
    const lum2 = getRelativeLuminance(rgb2);
    
    // Ensure lighter color is in numerator
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verify if contrast ratio meets WCAG AA standard (4.5:1)
 * @param {string} textColor - Text color (hex format)
 * @param {string} backgroundColor - Background color (hex format)
 * @returns {boolean} True if contrast is sufficient
 */
function verifyContrastRatio(textColor, backgroundColor) {
    const ratio = calculateContrastRatio(textColor, backgroundColor);
    return ratio >= 4.5;
}

/**
 * Get contrast ratio and verification result
 * @param {string} textColor - Text color (hex format)
 * @param {string} backgroundColor - Background color (hex format)
 * @returns {{ratio: number, passes: boolean}} Contrast information
 */
function getContrastInfo(textColor, backgroundColor) {
    const ratio = calculateContrastRatio(textColor, backgroundColor);
    return {
        ratio: ratio,
        passes: ratio >= 4.5
    };
}

// ===========================
// ResponsiveManager Class
// ===========================

/**
 * Manages responsive layout adjustments based on viewport size
 */
class ResponsiveManager {
    /**
     * Create a responsive manager
     */
    constructor() {
        this.currentDevice = null;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        this.resizeListeners = [];
        this.resizeTimeout = null;
        this.resizeDebounceDelay = 150; // ms
    }

    /**
     * Initialize the responsive manager
     */
    init() {
        // Detect initial device type
        this.updateViewportSize();
        
        // Check for abnormal viewport size
        if (this.isAbnormalViewportSize()) {
            this.handleAbnormalViewport();
        }
        
        this.currentDevice = this.detectDevice();
        
        // Add resize listener
        this.attachResizeListener();
        
        console.log(`ResponsiveManager initialized - Device: ${this.currentDevice}, Viewport: ${this.viewportWidth}x${this.viewportHeight}`);
    }
    
    /**
     * Check if viewport size is abnormally small
     * @returns {boolean} True if viewport is abnormally small (< 320px width)
     */
    isAbnormalViewportSize() {
        return this.viewportWidth < 320 || this.viewportHeight < 200;
    }
    
    /**
     * Handle abnormal viewport size
     * Applies minimal layout and ensures core content is visible
     */
    handleAbnormalViewport() {
        console.warn(`Abnormal viewport size detected: ${this.viewportWidth}x${this.viewportHeight}px`);
        console.log('Applying minimal layout scheme');
        
        // Add class to body for minimal layout
        document.body.classList.add('minimal-viewport');
        
        // Apply minimal layout styles
        this.applyMinimalLayout();
        
        // Show notification to user
        this.showViewportWarning();
    }
    
    /**
     * Apply minimal layout for very small viewports
     */
    applyMinimalLayout() {
        // Adjust greeting text to minimal size
        const greetingPrimary = document.querySelector('.greeting-primary');
        const greetingSecondary = document.querySelector('.greeting-secondary');
        
        if (greetingPrimary) {
            greetingPrimary.style.fontSize = '1.2rem';
            greetingPrimary.style.marginBottom = '0.25rem';
        }
        
        if (greetingSecondary) {
            greetingSecondary.style.fontSize = '0.9rem';
        }
        
        // Reduce Christmas tree size significantly
        const christmasTree = document.getElementById('christmasTree');
        if (christmasTree) {
            christmasTree.style.height = '30vh';
            christmasTree.style.maxWidth = '200px';
            christmasTree.style.transform = 'scale(0.7)';
        }
        
        // Hide decorations to reduce clutter
        const decorations = document.getElementById('decorations');
        if (decorations) {
            decorations.style.display = 'none';
        }
        
        // Minimize audio controls
        const audioControls = document.getElementById('audioControls');
        if (audioControls) {
            audioControls.style.bottom = '0.5rem';
            audioControls.style.right = '0.5rem';
            audioControls.style.padding = '0.4rem 0.8rem';
            audioControls.style.gap = '0.5rem';
            
            const audioButton = audioControls.querySelector('.audio-button');
            if (audioButton) {
                audioButton.style.width = '32px';
                audioButton.style.height = '32px';
            }
            
            const volumeSlider = audioControls.querySelector('.volume-slider');
            if (volumeSlider) {
                volumeSlider.style.width = '60px';
            }
        }
        
        // Reduce snowflake count if snowflake system exists
        if (ChristmasApp.snowflakeSystem) {
            ChristmasApp.snowflakeSystem.setParticleCount(15); // Minimal snowflakes
        }
        
        console.log('Minimal layout applied for abnormal viewport');
    }
    
    /**
     * Show viewport size warning to user
     */
    showViewportWarning() {
        // Check if warning already exists
        if (document.getElementById('viewport-warning')) {
            return;
        }
        
        const warning = document.createElement('div');
        warning.id = 'viewport-warning';
        warning.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 165, 0, 0.95);
            color: #333;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 11px;
            font-family: 'Raleway', sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: fadeIn 0.5s ease-in;
            text-align: center;
            max-width: 90%;
            line-height: 1.4;
        `;
        warning.innerHTML = `
            <strong>⚠️ 屏幕过小 / Screen Too Small</strong><br>
            <small>建议使用更大的屏幕以获得最佳体验<br>
            Please use a larger screen for best experience</small>
        `;
        
        document.body.appendChild(warning);
        
        // Keep warning visible longer (10 seconds)
        setTimeout(() => {
            warning.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                warning.remove();
            }, 500);
        }, 10000);
    }

    /**
     * Update viewport size properties
     */
    updateViewportSize() {
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
    }

    /**
     * Detect device type based on viewport width
     * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
     */
    detectDevice() {
        this.updateViewportSize();
        
        if (this.viewportWidth < 768) {
            return 'mobile';
        } else if (this.viewportWidth >= 768 && this.viewportWidth < 1024) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    /**
     * Get current device type
     * @returns {string} Current device type
     */
    getCurrentDevice() {
        return this.currentDevice;
    }

    /**
     * Get current viewport dimensions
     * @returns {{width: number, height: number}} Viewport dimensions
     */
    getViewportSize() {
        return {
            width: this.viewportWidth,
            height: this.viewportHeight
        };
    }

    /**
     * Check if device type has changed
     * @returns {boolean} True if device type changed
     */
    hasDeviceChanged() {
        const newDevice = this.detectDevice();
        return newDevice !== this.currentDevice;
    }

    /**
     * Attach resize event listener with debouncing
     */
    attachResizeListener() {
        const handleResize = () => {
            // Clear existing timeout
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }

            // Debounce resize events
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, this.resizeDebounceDelay);
        };

        window.addEventListener('resize', handleResize);
    }

    /**
     * Handle resize event
     */
    handleResize() {
        const previousDevice = this.currentDevice;
        const previousWidth = this.viewportWidth;
        const previousHeight = this.viewportHeight;

        // Update viewport size
        this.updateViewportSize();
        
        // Check for abnormal viewport size
        const isAbnormal = this.isAbnormalViewportSize();
        const wasAbnormal = previousWidth < 320 || previousHeight < 200;
        
        // Handle transition to/from abnormal viewport
        if (isAbnormal && !wasAbnormal) {
            // Viewport became abnormally small
            this.handleAbnormalViewport();
        } else if (!isAbnormal && wasAbnormal) {
            // Viewport recovered from abnormal size
            console.log('Viewport size recovered, removing minimal layout');
            document.body.classList.remove('minimal-viewport');
            
            // Remove viewport warning if it exists
            const warning = document.getElementById('viewport-warning');
            if (warning) {
                warning.remove();
            }
            
            // Reapply normal responsive styles
            const config = this.getResponsiveConfig();
            // This will be handled by the resize listeners
        }

        // Detect new device type
        const newDevice = this.detectDevice();

        // Check if device type changed
        const deviceChanged = newDevice !== previousDevice;

        if (deviceChanged) {
            console.log(`Device type changed: ${previousDevice} → ${newDevice}`);
            this.currentDevice = newDevice;
        }

        // Notify all registered listeners
        this.notifyResizeListeners({
            width: this.viewportWidth,
            height: this.viewportHeight,
            previousWidth,
            previousHeight,
            device: this.currentDevice,
            previousDevice,
            deviceChanged,
            isAbnormal,
            wasAbnormal
        });
    }

    /**
     * Register a resize listener callback
     * @param {Function} callback - Callback function to be called on resize
     */
    onResize(callback) {
        if (typeof callback === 'function') {
            this.resizeListeners.push(callback);
        }
    }

    /**
     * Unregister a resize listener callback
     * @param {Function} callback - Callback function to remove
     */
    offResize(callback) {
        const index = this.resizeListeners.indexOf(callback);
        if (index > -1) {
            this.resizeListeners.splice(index, 1);
        }
    }

    /**
     * Notify all resize listeners
     * @param {Object} resizeInfo - Information about the resize event
     */
    notifyResizeListeners(resizeInfo) {
        this.resizeListeners.forEach(callback => {
            try {
                callback(resizeInfo);
            } catch (error) {
                console.error('Error in resize listener:', error);
            }
        });
    }

    /**
     * Get responsive configuration for current device
     * @returns {Object} Configuration object with device-specific settings
     */
    getResponsiveConfig() {
        const device = this.currentDevice;
        
        return {
            device,
            snowflakeCount: this.getSnowflakeCount(),
            treeHeight: this.getTreeHeight(),
            fontSize: this.getFontSize(),
            decorationCount: this.getDecorationCount(),
            decorationSize: this.getDecorationSize()
        };
    }

    /**
     * Get appropriate snowflake count for current viewport
     * @returns {number} Snowflake particle count
     */
    getSnowflakeCount() {
        const area = this.viewportWidth * this.viewportHeight;
        const baseCount = 100;
        const baseArea = 1920 * 1080;
        
        let count = Math.floor((area / baseArea) * baseCount);
        
        // Reduce by 30% for small screens (< 768px width)
        if (this.viewportWidth < 768) {
            count = Math.floor(count * 0.7);
        }
        
        // Ensure minimum and maximum bounds
        count = Math.max(30, Math.min(200, count));
        
        return count;
    }

    /**
     * Get appropriate tree height for current device
     * @returns {string} CSS height value
     */
    getTreeHeight() {
        switch (this.currentDevice) {
            case 'mobile':
                return '40vh';
            case 'tablet':
                return '50vh';
            case 'desktop':
            default:
                return '60vh';
        }
    }

    /**
     * Get appropriate font size for current device
     * @returns {Object} Font sizes for primary and secondary text
     */
    getFontSize() {
        switch (this.currentDevice) {
            case 'mobile':
                return {
                    primary: '2rem',
                    secondary: '1.5rem'
                };
            case 'tablet':
                return {
                    primary: '3rem',
                    secondary: '2rem'
                };
            case 'desktop':
            default:
                return {
                    primary: '4rem',
                    secondary: '2.5rem'
                };
        }
    }

    /**
     * Get appropriate decoration count for current device
     * @returns {Object} Count for each decoration type
     */
    getDecorationCount() {
        switch (this.currentDevice) {
            case 'mobile':
                return {
                    gifts: 3,
                    stars: 4,
                    bells: 3
                };
            case 'tablet':
                return {
                    gifts: 4,
                    stars: 6,
                    bells: 4
                };
            case 'desktop':
            default:
                return {
                    gifts: 6,
                    stars: 8,
                    bells: 6
                };
        }
    }

    /**
     * Get appropriate decoration size for current device
     * @returns {Object} Size values for each decoration type
     */
    getDecorationSize() {
        switch (this.currentDevice) {
            case 'mobile':
                return {
                    gift: { width: 40, height: 40 },
                    star: '1.5rem',
                    bell: { width: 30, height: 40 }
                };
            case 'tablet':
                return {
                    gift: { width: 50, height: 50 },
                    star: '2rem',
                    bell: { width: 35, height: 45 }
                };
            case 'desktop':
            default:
                return {
                    gift: { width: 60, height: 60 },
                    star: '2.5rem',
                    bell: { width: 40, height: 50 }
                };
        }
    }

    /**
     * Check if viewport is in portrait orientation
     * @returns {boolean} True if portrait
     */
    isPortrait() {
        return this.viewportHeight > this.viewportWidth;
    }

    /**
     * Check if viewport is in landscape orientation
     * @returns {boolean} True if landscape
     */
    isLandscape() {
        return this.viewportWidth > this.viewportHeight;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        this.resizeListeners = [];
    }
}

// ===========================
// AnimationController Class
// ===========================

/**
 * Manages all animations using requestAnimationFrame with performance monitoring
 */
class AnimationController {
    /**
     * Create an animation controller
     */
    constructor() {
        this.animations = new Map(); // Map of animation name to animation function
        this.isRunning = false;
        this.animationFrameId = null;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        
        // Performance monitoring
        this.frameCount = 0;
        this.fpsHistory = [];
        this.fpsHistorySize = 60; // Track last 60 frames
        this.currentFPS = 60;
        this.performanceCheckInterval = 2000; // Check every 2 seconds
        this.lastPerformanceCheck = 0;
        this.lowPerformanceThreshold = 30; // FPS threshold for degradation
        this.lowPerformanceCount = 0;
        this.lowPerformanceLimit = 3; // Number of consecutive low performance checks before degradation
        
        // Performance degradation callbacks
        this.degradationCallbacks = [];
    }

    /**
     * Register an animation function
     * @param {string} name - Unique name for the animation
     * @param {Function} animationFn - Animation function to execute each frame
     */
    registerAnimation(name, animationFn) {
        if (typeof animationFn !== 'function') {
            console.error(`Animation function for "${name}" must be a function`);
            return false;
        }

        this.animations.set(name, {
            fn: animationFn,
            enabled: true
        });

        console.log(`Animation "${name}" registered`);
        return true;
    }

    /**
     * Unregister an animation
     * @param {string} name - Name of the animation to remove
     */
    unregisterAnimation(name) {
        if (this.animations.has(name)) {
            this.animations.delete(name);
            console.log(`Animation "${name}" unregistered`);
            return true;
        }
        return false;
    }

    /**
     * Enable a specific animation
     * @param {string} name - Name of the animation to enable
     */
    enableAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.enabled = true;
            console.log(`Animation "${name}" enabled`);
            return true;
        }
        return false;
    }

    /**
     * Disable a specific animation (for performance degradation)
     * @param {string} name - Name of the animation to disable
     */
    disableAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.enabled = false;
            console.log(`Animation "${name}" disabled`);
            return true;
        }
        return false;
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) {
            console.warn('AnimationController is already running');
            return;
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.lastPerformanceCheck = performance.now();
        this.frameCount = 0;
        this.fpsHistory = [];
        this.lowPerformanceCount = 0;

        console.log('AnimationController started');
        this.animate();
    }

    /**
     * Pause all animations
     */
    pause() {
        if (!this.isRunning) {
            console.warn('AnimationController is not running');
            return;
        }

        this.isRunning = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        console.log('AnimationController paused');
    }

    /**
     * Resume animations after pause
     */
    resume() {
        if (this.isRunning) {
            console.warn('AnimationController is already running');
            return;
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();

        console.log('AnimationController resumed');
        this.animate();
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) {
            return;
        }

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        // Frame rate limiting
        if (deltaTime >= this.frameInterval) {
            // Update frame time
            this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);

            // Execute all enabled animations
            for (const [name, animation] of this.animations) {
                if (animation.enabled) {
                    try {
                        animation.fn(deltaTime);
                    } catch (error) {
                        console.error(`Error in animation "${name}":`, error);
                    }
                }
            }

            // Update FPS tracking
            this.updateFPS(deltaTime);

            // Check performance periodically
            if (currentTime - this.lastPerformanceCheck >= this.performanceCheckInterval) {
                this.checkPerformance();
                this.lastPerformanceCheck = currentTime;
            }
        }

        // Request next frame
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Update FPS calculation
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    updateFPS(deltaTime) {
        // Calculate instantaneous FPS
        const instantFPS = 1000 / deltaTime;

        // Add to history
        this.fpsHistory.push(instantFPS);

        // Keep history size limited
        if (this.fpsHistory.length > this.fpsHistorySize) {
            this.fpsHistory.shift();
        }

        // Calculate average FPS from history
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        this.currentFPS = sum / this.fpsHistory.length;

        this.frameCount++;
    }

    /**
     * Check performance and trigger degradation if needed
     */
    checkPerformance() {
        // Check if FPS is below threshold
        if (this.currentFPS < this.lowPerformanceThreshold) {
            this.lowPerformanceCount++;

            console.warn(`Low performance detected: ${this.currentFPS.toFixed(2)} FPS (count: ${this.lowPerformanceCount}/${this.lowPerformanceLimit})`);

            // If low performance persists, trigger degradation
            if (this.lowPerformanceCount >= this.lowPerformanceLimit) {
                console.warn('Performance degradation threshold reached, triggering callbacks');
                this.triggerPerformanceDegradation();
                this.lowPerformanceCount = 0; // Reset counter after triggering
            }
        } else {
            // Reset counter if performance is good
            if (this.lowPerformanceCount > 0) {
                console.log('Performance recovered');
            }
            this.lowPerformanceCount = 0;
        }
    }

    /**
     * Trigger performance degradation callbacks
     */
    triggerPerformanceDegradation() {
        console.log('Triggering performance degradation callbacks');

        for (const callback of this.degradationCallbacks) {
            try {
                callback(this.currentFPS);
            } catch (error) {
                console.error('Error in degradation callback:', error);
            }
        }
    }

    /**
     * Register a callback for performance degradation
     * @param {Function} callback - Callback function to execute when performance degrades
     */
    onPerformanceDegradation(callback) {
        if (typeof callback === 'function') {
            this.degradationCallbacks.push(callback);
            console.log('Performance degradation callback registered');
        }
    }

    /**
     * Set target FPS
     * @param {number} fps - Target frames per second
     */
    setFPS(fps) {
        if (fps > 0 && fps <= 120) {
            this.targetFPS = fps;
            this.frameInterval = 1000 / this.targetFPS;
            console.log(`Target FPS set to ${fps}`);
        } else {
            console.error('Invalid FPS value. Must be between 1 and 120');
        }
    }

    /**
     * Get current FPS
     * @returns {number} Current average FPS
     */
    getCurrentFPS() {
        return this.currentFPS;
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        return {
            currentFPS: this.currentFPS,
            targetFPS: this.targetFPS,
            frameCount: this.frameCount,
            isRunning: this.isRunning,
            activeAnimations: Array.from(this.animations.entries())
                .filter(([, anim]) => anim.enabled)
                .map(([name]) => name),
            disabledAnimations: Array.from(this.animations.entries())
                .filter(([, anim]) => !anim.enabled)
                .map(([name]) => name)
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.pause();
        this.animations.clear();
        this.degradationCallbacks = [];
        this.fpsHistory = [];
        console.log('AnimationController destroyed');
    }
}

// Export for potential module usage

// ===========================
// Application Initialization
// ===========================

function init() {
    console.log('='.repeat(60));
    console.log('🎄 Initializing Christmas Theme Page...');
    console.log('='.repeat(60));
    
    try {
        // Initialize all modules using safe initialization wrapper
        
        // 1. Initialize Responsive Manager first (needed for other modules)
        safeInitModule('responsiveManager', () => {
            ChristmasApp.responsiveManager = new ResponsiveManager();
            ChristmasApp.responsiveManager.init();
            
            // Register resize listener for responsive adjustments
            ChristmasApp.responsiveManager.onResize((resizeInfo) => {
                handleResponsiveAdjustments(resizeInfo);
            });
            
            // Apply initial responsive adjustments
            const initialConfig = ChristmasApp.responsiveManager.getResponsiveConfig();
            applyResponsiveStyles(initialConfig);
            
            return true;
        }, ErrorSeverity.HIGH);
        
        // 2. Initialize Animation Controller
        safeInitModule('animationController', () => {
            ChristmasApp.animationController = new AnimationController();
            
            // Register performance degradation callback
            ChristmasApp.animationController.onPerformanceDegradation((currentFPS) => {
                handlePerformanceDegradation(currentFPS);
            });
            
            return true;
        }, ErrorSeverity.HIGH);
        
        // 3. Initialize Snowflake System (Canvas-based)
        safeInitModule('snowflakeSystem', () => {
            // Check for Canvas support - comprehensive detection
            const canvas = document.getElementById('snowCanvas');
            const hasCanvasElement = !!canvas;
            const hasGetContext = canvas && typeof canvas.getContext === 'function';
            const canGet2DContext = hasGetContext && !!canvas.getContext('2d');
            
            if (!hasCanvasElement || !hasGetContext || !canGet2DContext) {
                console.warn('Canvas not supported - Browser lacks Canvas API support');
                handleCanvasNotSupported();
                return false; // Not a critical failure
            }
            
            // Set canvas size
            resizeCanvas(canvas);
            
            // Calculate initial particle count based on viewport
            const initialParticleCount = calculateParticleCount(canvas.width, canvas.height);
            
            // Initialize snowflake system
            ChristmasApp.snowflakeSystem = new SnowflakeSystem(canvas, initialParticleCount);
            ChristmasApp.snowflakeSystem.init();
            
            // Register snowflake animation with controller
            if (ChristmasApp.animationController) {
                ChristmasApp.animationController.registerAnimation('snowflakes', (deltaTime) => {
                    ChristmasApp.snowflakeSystem.update();
                    ChristmasApp.snowflakeSystem.render();
                });
            }
            
            // Add resize listener
            window.addEventListener('resize', () => {
                resizeCanvas(canvas);
                if (ChristmasApp.snowflakeSystem) {
                    ChristmasApp.snowflakeSystem.resize(canvas.width, canvas.height);
                    
                    // Adjust particle count based on new viewport size
                    const newParticleCount = calculateParticleCount(canvas.width, canvas.height);
                    if (newParticleCount !== ChristmasApp.snowflakeSystem.particleCount) {
                        ChristmasApp.snowflakeSystem.setParticleCount(newParticleCount);
                    }
                }
            });
            
            return true;
        }, ErrorSeverity.LOW); // Low severity - CSS fallback available
        
        // 4. Start Animation Controller (after registering animations)
        if (ChristmasApp.animationController && ChristmasApp.moduleStatus.animationController === 'initialized') {
            ChristmasApp.animationController.start();
            console.log('✓ Animation loop started');
        }
        
        // 5. Initialize Christmas Tree Lights
        safeInitModule('christmasElements', () => {
            initChristmasTreeLights();
            initChristmasDecorations();
            
            // Add resize listener for decorations
            window.addEventListener('resize', () => {
                initChristmasDecorations();
            });
            
            return true;
        }, ErrorSeverity.MEDIUM);
        
        // 6. Initialize Audio Controller
        safeInitModule('audioController', () => {
            initAudioControls();
            return true;
        }, ErrorSeverity.LOW); // Low severity - audio is optional
        
        // 7. Initialize Interaction Handler
        safeInitModule('interactionHandler', () => {
            initInteractionHandler();
            return true;
        }, ErrorSeverity.MEDIUM);
        
        // 8. Initialize Animation Preferences
        safeInitModule('animationPreferences', () => {
            initAnimationPreferences();
            return true;
        }, ErrorSeverity.LOW);
        
        // Mark as initialized
        ChristmasApp.initialized = true;
        
        // Optimize resources for better performance
        optimizeResources();
        
        // Lazy load non-critical resources
        lazyLoadResources();
        
        // Monitor resource performance
        requestIdleCallbackPolyfill(() => {
            monitorResourcePerformance();
        });
        
        // Log health status
        const health = getAppHealth();
        console.log('='.repeat(60));
        console.log('🎄 Christmas Theme Page Initialization Complete!');
        console.log(`   Modules: ${health.initializedModules}/${health.totalModules} initialized`);
        if (health.failedModules > 0) {
            console.warn(`   ⚠️  ${health.failedModules} module(s) failed (non-critical)`);
        }
        console.log(`   Status: ${health.healthy ? '✓ Healthy' : '⚠️  Degraded'}`);
        console.log('='.repeat(60));
        
        // Announce successful initialization to screen readers
        announceToScreenReader('圣诞页面已加载完成');
        
    } catch (error) {
        handleError(error, 'Application initialization', ErrorSeverity.FATAL);
        handleInitializationError(error);
    }
}

/**
 * Start the application when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ChristmasApp, 
        init,
        hexToRgb,
        getRelativeLuminance,
        calculateContrastRatio,
        verifyContrastRatio,
        getContrastInfo,
        ResponsiveManager,
        AnimationController
    };
}
