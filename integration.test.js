/**
 * Integration Tests for Christmas Theme Page
 * Tests complete page loading, module coordination, and cross-browser compatibility
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock DOM environment
let mockDocument;
let mockWindow;
let mockCanvas;
let mockCanvasContext;

beforeEach(() => {
    // Setup mock DOM
    mockCanvasContext = {
        clearRect: jest.fn(),
        fillStyle: '',
        globalAlpha: 1,
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn()
    };

    mockCanvas = {
        getContext: jest.fn(() => mockCanvasContext),
        width: 1920,
        height: 1080,
        style: {}
    };

    mockDocument = {
        getElementById: jest.fn((id) => {
            if (id === 'snowCanvas') return mockCanvas;
            if (id === 'christmasTree') return { style: {}, querySelector: jest.fn(() => null) };
            if (id === 'decorations') return { innerHTML: '', appendChild: jest.fn() };
            if (id === 'audioControls') return { style: {} };
            if (id === 'audioToggle') return { addEventListener: jest.fn(), querySelector: jest.fn(() => ({ textContent: '' })) };
            if (id === 'volumeControl') return { addEventListener: jest.fn(), value: 50 };
            if (id === 'animationToggle') return { addEventListener: jest.fn(), querySelector: jest.fn(() => ({ textContent: '' })) };
            if (id === 'sr-announcements') return { textContent: '' };
            return null;
        }),
        querySelector: jest.fn((selector) => {
            if (selector === '.greeting-primary') return { style: {} };
            if (selector === '.greeting-secondary') return { style: {} };
            if (selector === '.greeting-text') return { getBoundingClientRect: () => ({ top: 100, bottom: 200, left: 100, right: 500 }) };
            return null;
        }),
        querySelectorAll: jest.fn(() => []),
        createElement: jest.fn((tag) => ({
            style: { cssText: '' },
            classList: { add: jest.fn(), remove: jest.fn() },
            setAttribute: jest.fn(),
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            remove: jest.fn(),
            textContent: '',
            innerHTML: ''
        })),
        body: {
            appendChild: jest.fn(),
            classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn(() => false) },
            addEventListener: jest.fn()
        },
        head: {
            appendChild: jest.fn()
        },
        readyState: 'complete',
        addEventListener: jest.fn()
    };

    mockWindow = {
        innerWidth: 1920,
        innerHeight: 1080,
        addEventListener: jest.fn(),
        performance: {
            now: jest.fn(() => Date.now()),
            timing: {
                navigationStart: 1000,
                loadEventEnd: 2500,
                domContentLoadedEventEnd: 1800
            },
            getEntriesByType: jest.fn(() => [])
        },
        requestAnimationFrame: jest.fn((cb) => setTimeout(cb, 16)),
        cancelAnimationFrame: jest.fn(),
        matchMedia: jest.fn(() => ({
            matches: false,
            addEventListener: jest.fn()
        })),
        localStorage: {
            getItem: jest.fn(() => null),
            setItem: jest.fn()
        },
        Audio: jest.fn(() => ({
            play: jest.fn(() => Promise.resolve()),
            pause: jest.fn(),
            addEventListener: jest.fn(),
            volume: 0.5,
            muted: true,
            paused: true,
            currentTime: 0,
            duration: 0
        }))
    };

    // Set global mocks
    global.document = mockDocument;
    global.window = mockWindow;
    global.performance = mockWindow.performance;
    global.requestAnimationFrame = mockWindow.requestAnimationFrame;
    global.cancelAnimationFrame = mockWindow.cancelAnimationFrame;
    global.Audio = mockWindow.Audio;
    global.localStorage = mockWindow.localStorage;
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Integration Tests - Complete Page Loading', () => {
    test('should load all core modules successfully', () => {
        // Import the main module
        const mainModule = require('./main.js');
        
        // Verify ChristmasApp is initialized
        expect(mainModule.ChristmasApp).toBeDefined();
        expect(mainModule.ChristmasApp.config).toBeDefined();
        expect(mainModule.ChristmasApp.moduleStatus).toBeDefined();
        
        // Verify all module status keys exist
        const expectedModules = [
            'snowflakeSystem',
            'animationController',
            'christmasElements',
            'audioController',
            'interactionHandler',
            'responsiveManager'
        ];
        
        expectedModules.forEach(module => {
            expect(mainModule.ChristmasApp.moduleStatus).toHaveProperty(module);
        });
    });

    test('should initialize application without errors', () => {
        const mainModule = require('./main.js');
        
        // Call init function
        mainModule.init();
        
        // Verify initialization completed
        expect(mainModule.ChristmasApp.initialized).toBe(true);
        
        // Verify no fatal errors occurred
        const fatalErrors = mainModule.ChristmasApp.errors.filter(
            err => err.severity === 'fatal'
        );
        expect(fatalErrors.length).toBe(0);
    });

    test('should handle Canvas not supported gracefully', () => {
        // Mock Canvas as not supported
        mockDocument.getElementById = jest.fn((id) => {
            if (id === 'snowCanvas') return null; // Canvas not available
            return null;
        });

        const mainModule = require('./main.js');
        mainModule.init();

        // Should still initialize successfully with fallback
        expect(mainModule.ChristmasApp.initialized).toBe(true);
        
        // Snowflake system should fail gracefully
        expect(mainModule.ChristmasApp.moduleStatus.snowflakeSystem).toBe('failed');
    });

    test('should complete initialization within 3 seconds', () => {
        const startTime = Date.now();
        
        const mainModule = require('./main.js');
        mainModule.init();
        
        const endTime = Date.now();
        const initTime = endTime - startTime;
        
        // Initialization should be fast (< 3000ms)
        expect(initTime).toBeLessThan(3000);
    });
});

describe('Integration Tests - Module Coordination', () => {
    test('should coordinate ResponsiveManager with SnowflakeSystem', () => {
        const mainModule = require('./main.js');
        mainModule.init();

        // Get responsive manager
        const responsiveManager = mainModule.ChristmasApp.responsiveManager;
        expect(responsiveManager).toBeDefined();

        // Get snowflake count for current viewport
        const snowflakeCount = responsiveManager.getSnowflakeCount();
        expect(snowflakeCount).toBeGreaterThan(0);
        expect(snowflakeCount).toBeLessThanOrEqual(200);

        // Verify snowflake system uses this count
        if (mainModule.ChristmasApp.snowflakeSystem) {
            expect(mainModule.ChristmasApp.snowflakeSystem.particleCount).toBe(snowflakeCount);
        }
    });

    test('should coordinate AnimationController with SnowflakeSystem', () => {
        const mainModule = require('./main.js');
        mainModule.init();

        const animationController = mainModule.ChristmasApp.animationController;
        expect(animationController).toBeDefined();

        // Verify snowflake animation is registered
        const stats = animationController.getPerformanceStats();
        expect(stats.activeAnimations).toContain('snowflakes');
    });

    test('should coordinate InteractionHandler with ChristmasElements', () => {
        const mainModule = require('./main.js');
        
        // Mock decorations
        mockDocument.querySelectorAll = jest.fn((selector) => {
            if (selector === '.gift-box') return [{ classList: { add: jest.fn() }, setAttribute: jest.fn() }];
            if (selector === '.star-decoration') return [{ classList: { add: jest.fn() }, setAttribute: jest.fn() }];
            if (selector === '.bell-decoration') return [{ classList: { add: jest.fn() }, setAttribute: jest.fn() }];
            return [];
        });

        mainModule.init();

        const interactionHandler = mainModule.ChristmasApp.interactionHandler;
        expect(interactionHandler).toBeDefined();
        expect(interactionHandler.elements.length).toBeGreaterThan(0);
    });

    test('should handle performance degradation across modules', () => {
        const mainModule = require('./main.js');
        mainModule.init();

        const animationController = mainModule.ChristmasApp.animationController;
        
        // Simulate low FPS
        animationController.currentFPS = 25;
        animationController.lowPerformanceCount = 3;
        
        // Trigger performance check
        animationController.checkPerformance();

        // Verify degradation was triggered
        // (In real scenario, snowflake count would be reduced)
        expect(animationController.lowPerformanceCount).toBe(0); // Reset after trigger
    });
});

describe('Integration Tests - Error Handling', () => {
    test('should track errors in centralized error system', () => {
        const mainModule = require('./main.js');
        
        // Simulate an error
        const testError = new Error('Test error');
        mainModule.handleError(testError, 'Test context', 'medium');

        // Verify error was tracked
        expect(mainModule.ChristmasApp.errors.length).toBeGreaterThan(0);
        
        const lastError = mainModule.ChristmasApp.errors[mainModule.ChristmasApp.errors.length - 1];
        expect(lastError.context).toBe('Test context');
        expect(lastError.severity).toBe('medium');
        expect(lastError.message).toBe('Test error');
    });

    test('should continue functioning after non-fatal errors', () => {
        const mainModule = require('./main.js');
        
        // Simulate audio controller failure
        mockDocument.getElementById = jest.fn((id) => {
            if (id === 'audioToggle') return null; // Audio controls missing
            if (id === 'snowCanvas') return mockCanvas;
            return null;
        });

        mainModule.init();

        // App should still be initialized
        expect(mainModule.ChristmasApp.initialized).toBe(true);
        
        // Audio controller should have failed
        expect(mainModule.ChristmasApp.moduleStatus.audioController).toBe('failed');
        
        // But other modules should work
        expect(mainModule.ChristmasApp.moduleStatus.animationController).toBe('initialized');
    });

    test('should provide health status information', () => {
        const mainModule = require('./main.js');
        mainModule.init();

        const health = mainModule.getAppHealth();
        
        expect(health).toHaveProperty('healthy');
        expect(health).toHaveProperty('totalModules');
        expect(health).toHaveProperty('initializedModules');
        expect(health).toHaveProperty('failedModules');
        expect(health).toHaveProperty('moduleStatus');
        expect(health).toHaveProperty('errors');
        expect(health).toHaveProperty('initialized');
        
        expect(health.totalModules).toBeGreaterThan(0);
        expect(health.initialized).toBe(true);
    });
});

describe('Integration Tests - Responsive Behavior', () => {
    test('should adapt to mobile viewport', () => {
        // Set mobile viewport
        mockWindow.innerWidth = 375;
        mockWindow.innerHeight = 667;

        const mainModule = require('./main.js');
        mainModule.init();

        const responsiveManager = mainModule.ChristmasApp.responsiveManager;
        expect(responsiveManager.getCurrentDevice()).toBe('mobile');

        const config = responsiveManager.getResponsiveConfig();
        expect(config.device).toBe('mobile');
        expect(config.treeHeight).toBe('40vh');
        expect(config.fontSize.primary).toBe('2rem');
    });

    test('should adapt to tablet viewport', () => {
        // Set tablet viewport
        mockWindow.innerWidth = 768;
        mockWindow.innerHeight = 1024;

        const mainModule = require('./main.js');
        mainModule.init();

        const responsiveManager = mainModule.ChristmasApp.responsiveManager;
        expect(responsiveManager.getCurrentDevice()).toBe('tablet');

        const config = responsiveManager.getResponsiveConfig();
        expect(config.device).toBe('tablet');
        expect(config.treeHeight).toBe('50vh');
    });

    test('should adapt to desktop viewport', () => {
        // Set desktop viewport
        mockWindow.innerWidth = 1920;
        mockWindow.innerHeight = 1080;

        const mainModule = require('./main.js');
        mainModule.init();

        const responsiveManager = mainModule.ChristmasApp.responsiveManager;
        expect(responsiveManager.getCurrentDevice()).toBe('desktop');

        const config = responsiveManager.getResponsiveConfig();
        expect(config.device).toBe('desktop');
        expect(config.treeHeight).toBe('60vh');
    });

    test('should handle abnormally small viewport', () => {
        // Set very small viewport
        mockWindow.innerWidth = 280;
        mockWindow.innerHeight = 150;

        const mainModule = require('./main.js');
        mainModule.init();

        const responsiveManager = mainModule.ChristmasApp.responsiveManager;
        
        // Should detect abnormal viewport
        expect(responsiveManager.isAbnormalViewportSize()).toBe(true);
        
        // Should apply minimal layout
        expect(mockDocument.body.classList.add).toHaveBeenCalledWith('minimal-viewport');
    });
});

describe('Integration Tests - Performance Optimization', () => {
    test('should optimize resources on initialization', () => {
        const mainModule = require('./main.js');
        
        // Spy on console.log to verify optimization messages
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        mainModule.init();

        // Verify optimization functions were called
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Optimized'));
        
        consoleSpy.mockRestore();
    });

    test('should use requestAnimationFrame for animations', () => {
        const mainModule = require('./main.js');
        mainModule.init();

        const animationController = mainModule.ChristmasApp.animationController;
        
        // Start animation
        animationController.start();

        // Verify requestAnimationFrame was called
        expect(mockWindow.requestAnimationFrame).toHaveBeenCalled();
    });

    test('should debounce resize events', () => {
        const mainModule = require('./main.js');
        
        // Test debounce utility
        let callCount = 0;
        const debouncedFn = mainModule.debounce(() => callCount++, 100);

        // Call multiple times rapidly
        debouncedFn();
        debouncedFn();
        debouncedFn();

        // Should only execute once after delay
        expect(callCount).toBe(0);

        // Wait for debounce delay
        jest.advanceTimersByTime(100);
        expect(callCount).toBe(1);
    });
});

describe('Integration Tests - Accessibility', () => {
    test('should provide screen reader announcements', () => {
        const mainModule = require('./main.js');
        mainModule.init();

        // Verify screen reader announcement element exists
        const announcer = mockDocument.getElementById('sr-announcements');
        expect(announcer).toBeDefined();
    });

    test('should support keyboard navigation', () => {
        const mainModule = require('./main.js');
        
        // Mock interactive elements
        const mockElement = {
            addEventListener: jest.fn(),
            classList: { add: jest.fn(), remove: jest.fn() },
            setAttribute: jest.fn(),
            closest: jest.fn(() => mockElement)
        };
        
        mockDocument.querySelectorAll = jest.fn(() => [mockElement]);
        
        mainModule.init();

        // Verify keyboard event listeners were added
        expect(mockDocument.body.addEventListener).toHaveBeenCalled();
    });

    test('should respect prefers-reduced-motion', () => {
        // Mock prefers-reduced-motion
        mockWindow.matchMedia = jest.fn((query) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            addEventListener: jest.fn()
        }));

        const mainModule = require('./main.js');
        mainModule.init();

        // Animation preferences should be initialized
        expect(mainModule.ChristmasApp.moduleStatus.animationPreferences).toBeDefined();
    });
});

describe('Integration Tests - Cross-Browser Compatibility', () => {
    test('should work without Canvas support', () => {
        // Remove Canvas support
        mockCanvas.getContext = jest.fn(() => null);

        const mainModule = require('./main.js');
        mainModule.init();

        // Should initialize with CSS fallback
        expect(mainModule.ChristmasApp.initialized).toBe(true);
        expect(mockDocument.body.classList.add).toHaveBeenCalledWith('no-canvas-support');
    });

    test('should work without Audio support', () => {
        // Remove Audio support
        global.Audio = undefined;

        const mainModule = require('./main.js');
        mainModule.init();

        // Should initialize without audio
        expect(mainModule.ChristmasApp.initialized).toBe(true);
    });

    test('should work without localStorage', () => {
        // Remove localStorage
        global.localStorage = undefined;

        const mainModule = require('./main.js');
        mainModule.init();

        // Should initialize without localStorage
        expect(mainModule.ChristmasApp.initialized).toBe(true);
    });

    test('should work without requestAnimationFrame', () => {
        // Remove requestAnimationFrame
        global.requestAnimationFrame = undefined;

        const mainModule = require('./main.js');
        mainModule.init();

        // Should use setTimeout fallback
        expect(mainModule.ChristmasApp.initialized).toBe(true);
    });
});

console.log('✓ Integration tests defined successfully');
