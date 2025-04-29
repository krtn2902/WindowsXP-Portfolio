// Windows XP Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize clock
    updateClock();
    setInterval(updateClock, 60000);
    
    // Desktop icons functionality
    initializeDesktopIcons();
    
    // Window functionality
    initializeWindows();
    
    // Start menu functionality
    initializeStartMenu();
    
    // Context menu functionality
    initializeContextMenu();
    
    // Handle clicks outside of menus to close them
    document.addEventListener('click', function(e) {
        // REMOVED: Logic to close start menu on outside click
        // if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
        //     closeStartMenu();
        // }

        // Keep context menu closing logic
        if (!e.target.closest('#context-menu')) {
            closeContextMenu();
        }
    });
    
    // Initialize form submission in contact window
    initializeContactForm();

    // Run the image generation when page loads
    setTimeout(generateWindowsXPImages, 100);
});

// Clock functionality
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}

// Desktop icons functionality
function initializeDesktopIcons() {
    const icons = document.querySelectorAll('.icon');
    
    icons.forEach(icon => {
        // Double click to open the corresponding application
        icon.addEventListener('dblclick', function() {
            const appName = this.getAttribute('data-app');
            openWindow(appName);
        });
        
        // Single click to select the icon
        icon.addEventListener('click', function(e) {
            // Deselect all icons first
            icons.forEach(i => i.classList.remove('selected'));
            // Select this icon
            this.classList.add('selected');
            e.stopPropagation();
        });
    });
    
    // Clicking on the desktop deselects all icons
    document.getElementById('desktop').addEventListener('click', function(e) {
        if (e.target === this) {
            icons.forEach(icon => icon.classList.remove('selected'));
        }
    });
}

// Window functionality
function initializeWindows() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(window => {
        // Initialize window position
        if (!window.style.top) {
            window.style.top = '50px';
            window.style.left = '50px';
            window.style.width = '600px';
            window.style.height = '400px';
        }
        
        // Make window draggable
        makeWindowDraggable(window);
        
        // Window controls (minimize, maximize, close)
        initializeWindowControls(window);
    });
}

function makeWindowDraggable(window) {
    const header = window.querySelector('.window-header');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    if (header) {
        header.addEventListener('mousedown', dragMouseDown);
    }
    
    function dragMouseDown(e) {
        if (e.target.tagName === 'BUTTON') return; // Don't drag if clicking on buttons
        
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        window.classList.add('dragging');
        
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
    }
    
    function elementDrag(e) {
        e.preventDefault();
        
        if (window.classList.contains('maximized')) return;
        
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        window.style.top = (window.offsetTop - pos2) + "px";
        window.style.left = (window.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        window.classList.remove('dragging');
    }
}

function initializeWindowControls(window) {
    const minimizeBtn = window.querySelector('.minimize');
    const maximizeBtn = window.querySelector('.maximize');
    const closeBtn = window.querySelector('.close');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function() {
            minimizeWindow(window);
        });
    }
    
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', function() {
            maximizeWindow(window);
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeWindow(window);
        });
    }
    
    // Clicking on the window brings it to the front
    window.addEventListener('mousedown', function() {
        bringToFront(window);
    });
}

function openWindow(appName) {
    const window = document.getElementById(`${appName}-window`);
    
    if (window) {
        const allWindows = document.querySelectorAll('.window');
        allWindows.forEach(w => {
            if (w !== window) {
                w.classList.remove('active');
            }
        });
        
        window.classList.add('active');
        window.classList.add('opening');
        window.style.display = 'flex';
        
        // Remove animation class after animation completes
        setTimeout(function() {
            window.classList.remove('opening');
        }, 300);
        
        bringToFront(window);
        addToTaskbar(appName);
    }
}

function closeWindow(window) {
    window.classList.add('minimizing');
    
    setTimeout(function() {
        window.style.display = 'none';
        window.classList.remove('minimizing', 'active');
        removeFromTaskbar(window.getAttribute('data-app'));
    }, 200);
}

function minimizeWindow(window) {
    window.classList.add('minimizing');
    
    setTimeout(function() {
        window.style.display = 'none';
        window.classList.remove('minimizing', 'active');
    }, 200);
}

function maximizeWindow(window) {
    if (window.classList.contains('maximized')) {
        // Restore
        window.classList.remove('maximized');
    } else {
        // Maximize
        window.classList.add('maximized');
    }
}

function bringToFront(window) {
    const allWindows = document.querySelectorAll('.window');
    allWindows.forEach(w => {
        w.classList.remove('active');
        w.style.zIndex = '100';
    });
    
    window.classList.add('active');
    window.style.zIndex = '500';
}

// Start menu functionality
function initializeStartMenu() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    
    // Ensure start menu is hidden initially
    startMenu.classList.add('hidden');
    
    startButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the document click handler from immediately closing it
        toggleStartMenu();
    });
    
    // Start menu program items
    const startPrograms = document.querySelectorAll('.start-program');
    startPrograms.forEach(program => {
        program.addEventListener('click', function() {
            const appName = this.querySelector('span').textContent.toLowerCase();
            closeStartMenu();
            openWindow(appName === 'projects' ? 'projects' : 
                       appName === 'experience' ? 'experience' : 
                       appName === 'resume' ? 'resume' : 'contact');
        });
    });
}

function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    
    if (startMenu.classList.contains('hidden')) {
        openStartMenu();
    } else {
        closeStartMenu();
    }
}

function openStartMenu() {
    const startMenu = document.getElementById('start-menu');
    startMenu.classList.remove('hidden');
    startMenu.classList.add('opening');
    
    setTimeout(function() {
        startMenu.classList.remove('opening');
    }, 200);
}

function closeStartMenu() {
    const startMenu = document.getElementById('start-menu');
    startMenu.classList.add('hidden');
}

// Taskbar functionality
function addToTaskbar(appName) {
    const openWindows = document.getElementById('open-windows');
    const existingItem = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
    
    if (!existingItem) {
        const window = document.getElementById(`${appName}-window`);
        const title = window.querySelector('.window-title span').textContent;
        const icon = window.querySelector('.window-title img').getAttribute('src');
        
        const taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-item active';
        taskbarItem.setAttribute('data-app', appName);
        taskbarItem.innerHTML = `
            <img src="${icon}" alt="${title}">
            <span>${title}</span>
        `;
        
        taskbarItem.addEventListener('click', function() {
            const window = document.getElementById(`${appName}-window`);
            
            if (window.style.display === 'none') {
                window.style.display = 'flex';
                bringToFront(window);
                this.classList.add('active');
            } else if (window.classList.contains('active')) {
                minimizeWindow(window);
                this.classList.remove('active');
            } else {
                bringToFront(window);
                this.classList.add('active');
            }
        });
        
        openWindows.appendChild(taskbarItem);
    } else {
        existingItem.classList.add('active');
    }
}

function removeFromTaskbar(appName) {
    const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
    if (taskbarItem) {
        taskbarItem.remove();
    }
}

// Context menu functionality
function initializeContextMenu() {
    const desktop = document.getElementById('desktop');
    const contextMenu = document.getElementById('context-menu');
    
    desktop.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        // Position the menu at the mouse position
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';
        
        // Make sure the menu is within the viewport
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = (e.clientX - rect.width) + 'px';
        }
        
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (e.clientY - rect.height) + 'px';
        }
        
        contextMenu.style.display = 'block';
    });
    
    // Change wallpaper option
    const changeWallpaper = document.getElementById('change-wallpaper');
    let currentWallpaper = 1;
    const totalWallpapers = 5; // Total number of wallpapers
    
    changeWallpaper.addEventListener('click', function() {
        currentWallpaper = (currentWallpaper % totalWallpapers) + 1;
        console.log(currentWallpaper);
        document.getElementById('desktop').style.backgroundImage = `url('images/wallpaper${currentWallpaper}.png')`;
        closeContextMenu();
    });
}

function closeContextMenu() {
    document.getElementById('context-menu').style.display = 'none';
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, you would send the form data to a server
            // For this portfolio, we'll just show a success message
            
            const msn = document.querySelector('.msn-chat');
            
            const message = document.createElement('div');
            message.className = 'chat-message received';
            message.innerHTML = `
                <span class="sender">Portfolio Owner says:</span>
                <p>Thanks for your message! I'll get back to you soon.</p>
            `;
            
            msn.appendChild(message);
            
            // Clear the form
            contactForm.reset();
        });
    }
}

// Show error message function (can be used for demo purposes)
function showError(message) {
    const errorWindow = document.getElementById('error-window');
    const errorMessage = errorWindow.querySelector('.error-message p');
    
    errorMessage.textContent = message || 'An unexpected error has occurred.';
    
    errorWindow.style.display = 'flex';
    bringToFront(errorWindow);
    
    const okButton = document.getElementById('error-ok');
    okButton.addEventListener('click', function() {
        errorWindow.style.display = 'none';
    });
}

// Preload wallpapers
function preloadWallpapers() {
    for (let i = 1; i <= 5; i++) {
        const img = new Image();
        img.src = `images/wallpaper${i}.jpg`;
    }
}
preloadWallpapers();

// Generate Windows XP style images dynamically
function generateWindowsXPImages() {
    // Generate wallpapers
    generateWallpapers();
    
    // Generate Windows XP icons
    generateIcons();
}

// Generate Windows XP wallpapers
function generateWallpapers() {
    const colors = [
        { primary: '#274184', secondary: '#78BDF0' }, // Bliss - classic XP blue/green
        { primary: '#5E3511', secondary: '#F3A642' }, // Autumn
        { primary: '#0F521B', secondary: '#74AC68' }, // Meadow
        { primary: '#511651', secondary: '#D276D3' }, // Purple
        { primary: '#323232', secondary: '#909090' }  // Silver
    ];
    
    for (let i = 1; i <= 5; i++) {
        createWallpaper(`wallpaper${i}`, colors[i-1]);
    }
}

// Create a single wallpaper
function createWallpaper(name, colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.secondary);
    gradient.addColorStop(1, colors.primary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some "hills" to mimic the classic XP wallpaper
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.bezierCurveTo(
        canvas.width * 0.3, canvas.height * 0.65,
        canvas.width * 0.6, canvas.height * 0.8,
        canvas.width, canvas.height
    );
    ctx.closePath();
    ctx.fill();
    
    // Add a smaller hill
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.bezierCurveTo(
        canvas.width * 0.4, canvas.height * 0.75,
        canvas.width * 0.7, canvas.height * 0.9,
        canvas.width, canvas.height
    );
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Convert to an image and apply to desktop
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Create a fake image element to be used as the background
    const img = new Image();
    img.src = dataUrl;
    img.className = `generated-wallpaper ${name}`;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // If this is wallpaper1, set it as the background right away
    if (name === 'wallpaper1') {
        document.getElementById('desktop').style.backgroundImage = `url(${dataUrl})`;
    }
    
    // Store in localStorage for persistence
    try {
        localStorage.setItem(name, dataUrl);
    } catch (e) {
        console.warn('Could not save wallpaper to localStorage:', e);
    }
}

// Generate Windows XP icons
function generateIcons() {
    const icons = [
        { name: 'folder', color: '#f8e060', type: 'folder' },
        { name: 'notepad', color: '#ffffff', type: 'notepad' },
        { name: 'word', color: '#2a5699', type: 'word' },
        { name: 'msn', color: '#0078d7', type: 'msn' },
        { name: 'my_computer', color: '#f0f0f0', type: 'computer' },
        { name: 'internet', color: '#0078d7', type: 'internet' },
        { name: 'email', color: '#f8e060', type: 'email' },
        { name: 'project-icon', color: '#f8e060', type: 'folder' },
        { name: 'documents', color: '#f8e060', type: 'folder' },
        { name: 'my_pictures', color: '#44aaee', type: 'folder' },
        { name: 'my_music', color: '#aa44ee', type: 'folder' },
        { name: 'control_panel', color: '#f0f0f0', type: 'control_panel' },
        { name: 'projects', color: '#f8e060', type: 'projects' },
        { name: 'experience', color: '#ffffff', type: 'experience' },
        { name: 'resume', color: '#2a5699', type: 'resume' },
        { name: 'contact', color: '#0078d7', type: 'contact' },
        { name: 'windows-logo', color: '#f0f0f0', type: 'windows-logo' },
        { name: 'user', color: '#f0f0f0', type: 'user' },
        { name: 'user-large', color: '#f0f0f0', type: 'user' },
        { name: 'msn-logo', color: '#0078d7', type: 'msn-logo' },
        { name: 'email-icon', color: '#f8e060', type: 'email' },
        { name: 'linkedin-icon', color: '#0077b5', type: 'linkedin' },
        { name: 'github-icon', color: '#333333', type: 'github' },
        { name: 'phone-icon', color: '#44aa44', type: 'phone' },
        { name: 'error', color: '#ff0000', type: 'error' },
        { name: 'shutdown', color: '#ff0000', type: 'shutdown' }
    ];
    
    icons.forEach(icon => {
        createIcon(icon.name, icon.color, icon.type);
    });
}

// Create a single icon
function createIcon(name, color, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw icon background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw icon based on type
    switch (type) {
        case 'folder':
            drawFolder(ctx, color);
            break;
        case 'notepad':
            drawNotepad(ctx, color);
            break;
        case 'word':
            drawWord(ctx, color);
            break;
        case 'msn':
            drawMSN(ctx, color);
            break;
        case 'computer':
            drawComputer(ctx, color);
            break;
        case 'internet':
            drawInternet(ctx, color);
            break;
        case 'email':
            drawEmail(ctx, color);
            break;
        case 'control_panel':
            drawControlPanel(ctx, color);
            break;
        case 'projects':
            drawProjects(ctx, color);
            break;
        case 'experience':
            drawExperience(ctx, color);
            break;
        case 'resume':
            drawResume(ctx, color);
            break;
        case 'contact':
            drawContact(ctx, color);
            break;
        case 'windows-logo':
            drawWindowsLogo(ctx, color);
            break;
        case 'user':
            drawUser(ctx, color);
            break;
        case 'msn-logo':
            drawMSNLogo(ctx, color);
            break;
        case 'linkedin':
            drawLinkedin(ctx, color);
            break;
        case 'github':
            drawGithub(ctx, color);
            break;
        case 'phone':
            drawPhone(ctx, color);
            break;
        case 'error':
            drawError(ctx, color);
            break;
        case 'shutdown':
            drawShutdown(ctx, color);
            break;
        default:
            drawDefaultIcon(ctx, color);
    }
    
    // Convert to an image 
    const dataUrl = canvas.toDataURL('image/png');
    
    // Update all the images in the DOM with this src
    const images = document.querySelectorAll(`img[src="images/${name}.png"]`);
    images.forEach(img => {
        img.src = dataUrl;
    });
    
    // Store in localStorage for persistence
    try {
        localStorage.setItem(`icon_${name}`, dataUrl);
    } catch (e) {
        console.warn('Could not save icon to localStorage:', e);
    }
}

// Drawing functions for different icon types
function drawFolder(ctx, color) {
    // Folder base
    ctx.fillStyle = color;
    ctx.fillRect(4, 8, 24, 18);
    
    // Folder tab
    ctx.fillStyle = color;
    ctx.fillRect(8, 5, 10, 3);
    
    // Folder outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 8, 24, 18);
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(8, 5);
    ctx.lineTo(18, 5);
    ctx.lineTo(18, 8);
    ctx.stroke();
}

function drawNotepad(ctx, color) {
    // Notepad base
    ctx.fillStyle = color;
    ctx.fillRect(6, 4, 20, 24);
    
    // Lines
    ctx.strokeStyle = '#aaaaaa';
    ctx.beginPath();
    for (let i = 8; i <= 24; i += 4) {
        ctx.moveTo(8, i);
        ctx.lineTo(24, i);
    }
    ctx.stroke();
    
    // Notepad outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 4, 20, 24);
}

function drawWord(ctx, color) {
    // Word document base
    ctx.fillStyle = color;
    ctx.fillRect(6, 4, 20, 24);
    
    // Word logo (W)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('W', 11, 20);
    
    // Document outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 4, 20, 24);
}

function drawMSN(ctx, color) {
    // MSN base (person)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 10, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(16, 16);
    ctx.lineTo(16, 24);
    ctx.lineTo(20, 28);
    ctx.moveTo(16, 24);
    ctx.lineTo(12, 28);
    ctx.stroke();
    
    // Chat bubble
    ctx.beginPath();
    ctx.arc(24, 8, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
}

function drawComputer(ctx, color) {
    // Monitor
    ctx.fillStyle = color;
    ctx.fillRect(8, 4, 16, 12);
    ctx.fillStyle = '#0000aa';
    ctx.fillRect(10, 6, 12, 8);
    
    // Base
    ctx.fillStyle = color;
    ctx.fillRect(12, 16, 8, 4);
    ctx.fillRect(10, 20, 12, 2);
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 4, 16, 12);
    ctx.strokeRect(12, 16, 8, 4);
    ctx.strokeRect(10, 20, 12, 2);
}

function drawInternet(ctx, color) {
    // Globe
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // "e"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('e', 13, 20);
    
    // Globe outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.stroke();
}

function drawEmail(ctx, color) {
    // Envelope
    ctx.fillStyle = color;
    ctx.fillRect(6, 10, 20, 12);
    
    // Envelope flap
    ctx.beginPath();
    ctx.moveTo(6, 10);
    ctx.lineTo(16, 16);
    ctx.lineTo(26, 10);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 10, 20, 12);
    ctx.beginPath();
    ctx.moveTo(6, 10);
    ctx.lineTo(16, 16);
    ctx.lineTo(26, 10);
    ctx.stroke();
}

function drawControlPanel(ctx, color) {
    // Control panel base
    ctx.fillStyle = color;
    ctx.fillRect(8, 8, 16, 16);
    
    // Sliders
    ctx.fillStyle = '#0078d7';
    ctx.fillRect(10, 12, 12, 2);
    ctx.fillRect(10, 16, 12, 2);
    ctx.fillRect(10, 20, 12, 2);
    
    // Knobs
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(14, 13, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(18, 17, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.arc(16, 21, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 16, 16);
}

function drawProjects(ctx, color) {
    // Projects base (document stack)
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i === 0 ? color : '#ffffff';
        ctx.fillRect(8 - i, 8 - i, 16, 20);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(8 - i, 8 - i, 16, 20);
    }
    
    // Label
    ctx.fillStyle = '#000000';
    ctx.font = '6px Arial';
    ctx.fillText('Projects', 9, 20);
}

function drawExperience(ctx, color) {
    // Experience base (notepad)
    ctx.fillStyle = color;
    ctx.fillRect(6, 4, 20, 24);
    
    // Lines with checkmarks
    ctx.strokeStyle = '#aaaaaa';
    ctx.beginPath();
    for (let i = 10; i <= 24; i += 6) {
        ctx.moveTo(8, i);
        ctx.lineTo(22, i);
    }
    ctx.stroke();
    
    // Checkmarks
    ctx.strokeStyle = '#00aa00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, 9);
    ctx.lineTo(12, 11);
    ctx.lineTo(15, 7);
    ctx.moveTo(10, 15);
    ctx.lineTo(12, 17);
    ctx.lineTo(15, 13);
    ctx.moveTo(10, 21);
    ctx.lineTo(12, 23);
    ctx.lineTo(15, 19);
    ctx.stroke();
    
    // Notepad outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 4, 20, 24);
}

function drawResume(ctx, color) {
    // Resume base (document)
    ctx.fillStyle = color;
    ctx.fillRect(6, 4, 20, 24);
    
    // Resume header/content
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 6, 16, 2);
    ctx.fillRect(8, 10, 12, 1);
    ctx.fillRect(8, 13, 16, 1);
    ctx.fillRect(8, 16, 16, 1);
    ctx.fillRect(8, 19, 16, 1);
    ctx.fillRect(8, 22, 10, 1);
    
    // Document outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 4, 20, 24);
}

function drawContact(ctx, color) {
    // Contact base (address book)
    ctx.fillStyle = color;
    ctx.fillRect(6, 6, 20, 20);
    
    // Contact icon (person)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 12, 4, 0, Math.PI * 2);
    ctx.moveTo(16, 16);
    ctx.lineTo(16, 22);
    ctx.moveTo(12, 19);
    ctx.lineTo(20, 19);
    ctx.stroke();
    
    // Address book outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, 20, 20);
}

function drawWindowsLogo(ctx, color) {
    // Windows flag (simplified)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(16, 8, 8, 8);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(8, 16, 8, 8);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(16, 16, 8, 8);
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 16, 16);
}

function drawUser(ctx, color) {
    // User icon (head and shoulders)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 12, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(16, 18);
    ctx.lineTo(16, 26);
    ctx.bezierCurveTo(8, 26, 8, 18, 16, 18);
    ctx.bezierCurveTo(24, 18, 24, 26, 16, 26);
    ctx.closePath();
    ctx.fill();
}

function drawMSNLogo(ctx, color) {
    // MSN butterfly
    ctx.fillStyle = color;
    
    // Left wing
    ctx.beginPath();
    ctx.arc(12, 12, 6, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.arc(20, 12, 6, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    
    // Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(16, 16, 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(12, 12, 6, Math.PI, 0, true);
    ctx.arc(20, 12, 6, Math.PI, 0, true);
    ctx.ellipse(16, 16, 2, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function drawLinkedin(ctx, color) {
    // LinkedIn logo
    ctx.fillStyle = color;
    ctx.fillRect(6, 6, 20, 20);
    
    // "in" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('in', 12, 20);
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, 20, 20);
}

function drawGithub(ctx, color) {
    // GitHub logo (cat outline)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Cat features
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(12, 12);
    ctx.lineTo(10, 8);
    ctx.moveTo(20, 12);
    ctx.lineTo(22, 8);
    
    // Face
    ctx.moveTo(12, 18);
    ctx.bezierCurveTo(14, 20, 18, 20, 20, 18);
    
    // Eyes
    ctx.moveTo(13, 15);
    ctx.arc(13, 15, 1, 0, Math.PI * 2);
    ctx.moveTo(19, 15);
    ctx.arc(19, 15, 1, 0, Math.PI * 2);
    ctx.stroke();
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPhone(ctx, color) {
    // Phone base
    ctx.fillStyle = color;
    ctx.fillRect(10, 6, 12, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 8, 8, 10);
    
    // Buttons
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(13, 20, 2, 2);
    ctx.fillRect(16, 20, 2, 2);
    ctx.fillRect(13, 22, 2, 2);
    ctx.fillRect(16, 22, 2, 2);
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 6, 12, 20);
    ctx.strokeRect(12, 8, 8, 10);
}

function drawError(ctx, color) {
    // Error icon (circle with X)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // X
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 12);
    ctx.lineTo(20, 20);
    ctx.moveTo(20, 12);
    ctx.lineTo(12, 20);
    ctx.stroke();
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.stroke();
}

function drawShutdown(ctx, color) {
    // Power button
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(16, 16, 8, 0, Math.PI * 2);
    ctx.moveTo(16, 9);
    ctx.lineTo(16, 19);
    ctx.stroke();
}

function drawDefaultIcon(ctx, color) {
    // Generic icon
    ctx.fillStyle = color;
    ctx.fillRect(8, 8, 16, 16);
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 16, 16);
}