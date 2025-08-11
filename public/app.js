// === CONFIGURATION ===
const SOLANA_NETWORK = 'https://api.devnet.solana.com';

const API_BASE = window.API_BASE || '';
       
// === GLOBAL STATE ===
let walletAddress = null;
let connection = null;
let provider = null;
let events = [];
let allEvents = [];

// Default events loaded when no data available from server
const defaultEvents = [
      {
          id: '1',
          title: '42 School Hackathon',
          organization: '42 School',
          goal: 2000,
          raised: 1500,
          description: '48 hours of creativity and coding for students and enthusiasts.',
          imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          type: 'event',
          tickets: [
              { id: 1, name: 'Day Pass', price: 0.5, quantity: 100, sold: 20 },
              { id: 2, name: 'Weekend Pass', price: 0.9, quantity: 80, sold: 10 }
          ]
      },
      {
          id: '2',
          title: 'Central Lyon Challenge',
          organization: 'Central Lyon',
          goal: 4000,
          raised: 3000,
          description: 'Inter-school sports tournament with various disciplines and a festive atmosphere.',
          imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',

          beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          type: 'event',
          tickets: [
              { id: 1, name: 'Spectator Pass', price: 0.3, quantity: 200, sold: 50 },
              { id: 2, name: 'Competitor Pass', price: 0.6, quantity: 150, sold: 30 }
          ]
      },
      {
          id: '3',
          title: 'Polytechnic Point Gamma',
          organization: 'Polytechnic School',
          goal: 6000,
          raised: 4500,
          description: 'The largest student gala in Europe organized by the Polytechnic School.',

        imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',

          beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          type: 'event',
          tickets: [
              { id: 1, name: 'Standard Entry', price: 1.2, quantity: 300, sold: 120 },
              { id: 2, name: 'VIP Entry', price: 2.5, quantity: 100, sold: 40 }
          ]
      },
      {
          id: '4',
          title: 'Solana Foundation Conference Paris',
          organization: 'Solana Foundation',
          goal: 8000,
          raised: 0,
          description: 'A flagship Solana conference hosted by the Solana Foundation in Paris. Talks, workshops and ecosystem showcases.',
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
          type: 'event',
          location: 'Paris, France',
          tickets: [
              { id: 1, name: 'General Admission', price: 0.8, quantity: 400, sold: 0 },
              { id: 2, name: 'Builder Pass', price: 1.2, quantity: 200, sold: 0 },
              { id: 3, name: 'VIP', price: 2.0, quantity: 50, sold: 0 }
          ]
      }
];

// === UTILITIES ===
function parseSOL(value) {
    return parseFloat(value.toString().replace(',', '.')) || 0;
}

function formatSOL(amount) {
    return parseFloat(amount).toFixed(2);
}

function truncateAddress(address) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function showMessage(containerId, type, text, duration = 5000) {
    const container = document.getElementById(containerId);
    const icons = { success: '✅', error: '❌', warning: '⚠️' };

    container.innerHTML = `<div class="message ${type}">${icons[type]} ${text}</div>`;
    
    if (duration > 0) {
        setTimeout(() => {
            container.innerHTML = '';
        }, duration);
    }
}

async function showModal({ title, message, showCancel = false, input = false, defaultValue = '' }) {
    return new Promise(resolve => {
        let modal = document.getElementById('popupModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'popupModal';
            modal.className = 'popup-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title" id="popupTitle"></div>
                        <button class="modal-close" id="popupClose">&times;</button>
                    </div>
                    <div class="modal-body" id="popupMessage"></div>
                    <div class="modal-input" id="popupInputContainer" style="display:none;">
                        <input type="text" id="popupInput" class="form-input" />
                    </div>
                    <div class="modal-actions" id="popupActions"></div>
                </div>`;
            document.body.appendChild(modal);
        }

        const titleEl = document.getElementById('popupTitle');
        const messageEl = document.getElementById('popupMessage');
        const inputContainer = document.getElementById('popupInputContainer');
        const inputEl = document.getElementById('popupInput');
        const actionsEl = document.getElementById('popupActions');
        const closeBtn = document.getElementById('popupClose');

        titleEl.textContent = title || '';
        messageEl.innerHTML = message.replace(/\n/g, '<br>');

        if (input) {
            inputContainer.style.display = 'block';
            inputEl.value = defaultValue;
        } else {
            inputContainer.style.display = 'none';
            inputEl.value = '';
        }

        actionsEl.innerHTML = '';

        function close(result) {
            modal.classList.remove('show');
            document.removeEventListener('keydown', keyHandler);
            resolve(result);
        }

        const okBtn = document.createElement('button');
        okBtn.textContent = showCancel ? 'OK' : 'Close';
        okBtn.className = 'btn btn-primary';
        okBtn.onclick = () => {
            const result = input ? inputEl.value.trim() : true;
            close(result);
        };
        actionsEl.appendChild(okBtn);

        const cancelResult = input ? null : false;
        if (showCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.onclick = () => close(cancelResult);
            actionsEl.appendChild(cancelBtn);
            closeBtn.onclick = () => close(cancelResult);
            modal.onclick = e => { if (e.target === modal) close(cancelResult); };
        } else {
            closeBtn.onclick = () => close(true);
            modal.onclick = e => { if (e.target === modal) close(true); };
        }

        const keyHandler = e => {
            if (e.key === 'Escape') close(showCancel ? cancelResult : true);
        };
        document.addEventListener('keydown', keyHandler);

        modal.classList.add('show');
        if (input) inputEl.focus();
    });
}

function customAlert(message, title = 'Alert') {
    return showModal({ title, message });
}

function customConfirm(message, title = 'Confirm') {
    return showModal({ title, message, showCancel: true });
}

function customPrompt(message, title = 'Input', defaultValue = '') {
    return showModal({ title, message, showCancel: true, input: true, defaultValue });
}

// === NAVIGATION ===
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    // Show the target section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    if (sectionName === 'home') navItems[0].classList.add('active');
    else if (sectionName === 'create') navItems[1].classList.add('active');
    else if (sectionName === 'explore') navItems[2].classList.add('active');
    
    // Load events if needed
    if (sectionName === 'explore') {
        displayEvents();
    }
}

// === WALLET MANAGEMENT ===
async function toggleWallet() {
    provider = getProvider();
    if (!walletAddress) {
        if (!provider) {
            window.open('https://phantom.app/', '_blank', 'noopener');
            const installLink = '<a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">Install Phantom</a>';
            showMessage('createMessages', 'error', `No wallet detected. ${installLink}`);
            showMessage('exploreMessages', 'error', `No wallet detected. ${installLink}`);
            return;
        }
        await connectWallet();
        return;
    }
    if (await customConfirm('Do you want to disconnect your wallet?')) {
        await disconnectWallet();
    }
}

function getProvider() {
    // Prefer the explicit Phantom provider if available
    if (window.phantom && window.phantom.solana && window.phantom.solana.isPhantom) {
        return window.phantom.solana;
    }

    // Fallback to the legacy global Solana provider
    if ('solana' in window) {
        const provider = window.solana;
        if (provider && provider.isPhantom) return provider;
    }

    return null;
}

async function connectWallet() {
    provider = getProvider();
    if (!provider) {
        const installLink = '<a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">Install Phantom</a>';
        const phantomLogo = '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3c4.97 0 9 3.582 9 8v3.5c0 3.59-2.91 6.5-6.5 6.5H9.5C5.91 21 3 18.09 3 14.5V11c0-4.418 4.03-8 9-8z" fill="#8a2be2" opacity="0.3"/><path d="M9 10.5c0-.828.672-1.5 1.5-1.5S12 9.672 12 10.5 11.328 12 10.5 12 9 11.328 9 10.5zm4.5 0c0-.828.672-1.5 1.5-1.5S16.5 9.672 16.5 10.5 15.828 12 15 12s-1.5-.672-1.5-1.5zM8.5 14.5c.7 1.2 2.07 2 3.5 2s2.8-.8 3.5-2" stroke="#8a2be2" stroke-width="1.5" stroke-linecap="round"/></svg>Phantom</span>';
        const text = `No wallet detected. This app uses ${phantomLogo}. ${installLink} to continue.`;
        showMessage('createMessages', 'error', text, 8000);
        showMessage('exploreMessages', 'error', text, 8000);
        return;
    }

    try {
        const response = await provider.connect();
        walletAddress = response.publicKey.toString();
        connection = new solanaWeb3.Connection(SOLANA_NETWORK, 'confirmed');
        updateWalletUI();
        displayEvents();
        console.log('✅ Wallet connected:', walletAddress);
        showMessage('createMessages', 'success', 'Wallet connected successfully');
        showMessage('exploreMessages', 'success', 'Wallet connected successfully');
        try {
            await fetch(`${API_BASE}/auth/wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicKey: walletAddress })
            });
        } catch (e) {
            console.error('Auth failed', e);
        }
    } catch (error) {
        console.error('❌ Wallet connection error:', error);
        const msg =
            error && (error.message?.includes('User rejected') || error.code === 4001)
                ? 'Connection denied'
                : 'Connection failed';
        showMessage('createMessages', 'error', msg);
        showMessage('exploreMessages', 'error', msg);
    }
}

async function disconnectWallet() {
    try {
        if (provider && provider.isConnected) {
            await provider.disconnect();
        }
        walletAddress = null;
        connection = null;
        updateWalletUI();
        displayEvents();
        showMessage('createMessages', 'success', 'Wallet disconnected');
        showMessage('exploreMessages', 'success', 'Wallet disconnected');
    } catch (error) {
        console.error('❌ Disconnect error:', error);
        showMessage('createMessages', 'error', 'Disconnect failed');
        showMessage('exploreMessages', 'error', 'Disconnect failed');
    }
}

async function payWithPhantom(toAddress, lamports) {
    provider = provider || getProvider();
    if (!provider || !provider.isPhantom) throw new Error('Please connect your Phantom wallet');

    if (!provider.isConnected) {
        const response = await provider.connect();
        walletAddress = response.publicKey.toString();
        updateWalletUI();
    } else {
        walletAddress = provider.publicKey.toString();
    }

    connection = connection || new solanaWeb3.Connection(SOLANA_NETWORK, 'confirmed');

    // Build transfer transaction
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: new solanaWeb3.PublicKey(toAddress),
            lamports
        })
    );

    transaction.feePayer = provider.publicKey;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign in Phantom, send via our connection to ensure correct cluster
    const signedTx = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    return signature;
}

function updateWalletUI() {
    const btn = document.getElementById('walletBtn');
    const text = document.getElementById('walletText');
    const walletInput = document.getElementById('userWallet');

    const phantomAvailable = !!getProvider();
    if (walletAddress) {
        btn.classList.add('connected');
        text.textContent = truncateAddress(walletAddress);
        if (walletInput) walletInput.value = walletAddress;
        // Fetch and show balance
        try {
            const conn = connection || new solanaWeb3.Connection(SOLANA_NETWORK, 'confirmed');
            conn.getBalance(new solanaWeb3.PublicKey(walletAddress)).then(lamports => {
                const sol = (lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(3);
                text.textContent = `${truncateAddress(walletAddress)} • ${sol} SOL`;
            }).catch(() => {});
        } catch (_) {}
    } else {
        btn.classList.remove('connected');
        text.textContent = phantomAvailable ? 'Connect Phantom Wallet' : 'Install Phantom Wallet';
        if (walletInput) walletInput.value = '';
    }

    ensurePhantomBanner();
}

function ensurePhantomBanner() {
    try {
        const existing = document.getElementById('phantomBanner');
        const hasWallet = !!walletAddress;
        const phantomAvailable = !!getProvider();
        if (hasWallet || phantomAvailable) {
            if (existing) existing.remove();
            return;
        }
        if (existing) return;

        const banner = document.createElement('div');
        banner.id = 'phantomBanner';
        banner.style.cssText = 'position:sticky;top:0;z-index:50; background: rgba(138,43,226,0.12); border:1px solid rgba(138,43,226,0.35); color:#e9d5ff; padding:10px 14px; display:flex; align-items:center; gap:10px; border-radius:10px; margin:12px 0;';
        banner.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3c4.97 0 9 3.582 9 8v3.5c0 3.59-2.91 6.5-6.5 6.5H9.5C5.91 21 3 18.09 3 14.5V11c0-4.418 4.03-8 9-8z" fill="#8a2be2" opacity="0.35"/>
                <path d="M9 10.5c0-.828.672-1.5 1.5-1.5S12 9.672 12 10.5 11.328 12 10.5 12 9 11.328 9 10.5zm4.5 0c0-.828.672-1.5 1.5-1.5S16.5 9.672 16.5 10.5 15.828 12 15 12s-1.5-.672-1.5-1.5zM8.5 14.5c.7 1.2 2.07 2 3.5 2s2.8-.8 3.5-2" stroke="#8a2be2" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <div style="flex:1">No wallet detected. This app uses <strong>Phantom</strong> for payments and tickets.</div>
            <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" style="background:#8a2be2;color:white;padding:8px 12px;border-radius:8px;text-decoration:none;">Install Phantom</a>
        `;
        const container = document.querySelector('.container');
        if (container) container.prepend(banner);
    } catch (_) {}
}

// === EVENT MANAGEMENT ===
async function loadEvents() {
    try {
        const res = await fetch(`${API_BASE}/events`);
        events = await res.json();
        allEvents = [...events];
    } catch (error) {
        console.error('Error loading events:', error);
        events = [...defaultEvents];
        allEvents = [...defaultEvents];
    }
    displayEvents();
}

function saveEvents() {
    // Storage handled server-side
}

function displayEvents() {
    const container = document.getElementById('eventsContainer');
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <div class="empty-title">No events</div>
                <p class="empty-description">Be the first to create an event or launch a campaign</p>
                <button class="btn btn-primary" onclick="showSection('create')">
                    Create an Event
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => {
        const progress = Math.min(100, (event.raised / event.goal) * 100);
        const canDelete = walletAddress && event.creatorWallet === walletAddress;
        const isEvent = event.type === 'event';
        const eventTypeIcon = isEvent ? '🎫' : '💰';
        const eventTypeLabel = isEvent ? 'Event' : 'Funding';

        // For events with ticketing
        let ticketInfo = '';
        if (isEvent && event.tickets) {
            const totalTickets = event.tickets.reduce((sum, t) => sum + t.quantity, 0);
            const soldTickets = event.tickets.reduce((sum, t) => sum + (t.sold || 0), 0);
            ticketInfo = `
                <div class="ticket-stats">
                      <span class="ticket-stat">${soldTickets}/${totalTickets} tickets sold</span>
                      <span class="event-date">${event.date ? new Date(event.date).toLocaleDateString('en-US') : ''}</span>
                </div>
            `;
        }

        return `
            <div class="project-card">
                <div class="project-image">
                    ${event.imageUrl ?
                        `<img src="${event.imageUrl}" alt="${event.title}">` :
                        eventTypeIcon
                    }
                </div>
                <div class="event-type-badge">${eventTypeLabel}</div>
                <div class="project-info">
                    <h3 class="project-title">${event.title}</h3>
                    <p class="project-org">${event.organization}</p>
                    ${event.location ? `<p class="event-location">📍 ${event.location}</p>` : ''}

                    ${ticketInfo}

                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>

                    <div class="project-meta">
                        <span>${formatSOL(event.raised)} / ${formatSOL(event.goal)} SOL</span>
                        <span>${progress.toFixed(0)}%</span>
                    </div>

                    <p class="project-description">${event.description}</p>

                    ${isEvent && event.tickets ? `
                        <div class="ticket-types-preview">
                            ${event.tickets.slice(0, 2).map(ticket => `
                                <div class="ticket-preview">
                                    <span class="ticket-name">${ticket.name}</span>
                                    <span class="ticket-price">${formatSOL(ticket.price)} SOL</span>
                                </div>
                            `).join('')}
                              ${event.tickets.length > 2 ? `<div class="more-tickets">+${event.tickets.length - 2} more</div>` : ''}
                        </div>
                    ` : ''}

                    <div class="project-actions">
                        ${isEvent ? `
                              <button class="btn btn-primary" type="button" onclick="showTickets(${event.id})">
                                  Buy tickets
                              </button>
                        ` : `
                              <button class="btn btn-primary" type="button" onclick="fundEvent('${event.id}')" ${!walletAddress ? 'disabled' : ''}>
                                  Contribute
                              </button>
                        `}
                        ${canDelete ?
                              `<button class="btn btn-ghost" onclick="deleteEvent('${event.id}')">
                                  Delete
                              </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Enable search in Explore section
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
            events = [...allEvents];
        } else {
            events = allEvents.filter(ev =>
                ev.title.toLowerCase().includes(query) ||
                ev.organization.toLowerCase().includes(query)
            );
        }
        displayEvents();
    });
}

// === FUNDING ===
async function fundEvent(eventId) {
    if (!walletAddress) {
        showMessage('createMessages', 'error', 'Connect your wallet first');
        return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const amountStr = await customPrompt(`Fund "${event.title}"\nAmount in SOL (e.g., 10.5):`);
    if (!amountStr) return;

    const amount = parseSOL(amountStr);
    if (amount <= 0) {
        await customAlert('Invalid amount');
        return;
    }

    try {
        // Simulated Solana transaction
        const confirmed = await customConfirm(
            `Confirm transaction:\n\n` +
            `Amount: ${formatSOL(amount)} SOL\n` +
            `To: ${truncateAddress(event.beneficiaryWallet)}\n` +
            `Project: ${event.title}\n\n` +
            `⚠️ Devnet simulation`
        );
        
        if (!confirmed) return;

        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update
        event.raised += amount;
        saveEvents();
        displayEvents();
        
        showMessage('createMessages', 'success', `${formatSOL(amount)} SOL funded successfully`);
        
        console.log(`✅ Funded ${amount} SOL to:`, event.title);

    } catch (error) {
        console.error('❌ Transaction error:', error);
        showMessage('createMessages', 'error', 'Transaction failed');
    }
}

// === DELETION ===
async function deleteEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (!await customConfirm(`Remove "${event.title}"?`)) return;

    try {
        events = events.filter(e => e.id !== eventId);
        saveEvents();
        displayEvents();
        
        showMessage('createMessages', 'success', `Protocol "${event.title}" removed`);
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        showMessage('createMessages', 'error', 'Failed to remove protocol');
    }
}

// === INITIALIZATION ===
window.addEventListener('load', async () => {
    console.log('🚀 Evento loaded');

    // Load events
    loadEvents();
    displayEvents();

    // Attempt to reconnect Phantom if already trusted
    provider = getProvider();
    if (provider) {
        try {
            const resp = await provider.connect({ onlyIfTrusted: true });
            walletAddress = resp.publicKey.toString();
            connection = new solanaWeb3.Connection(SOLANA_NETWORK, 'confirmed');
            updateWalletUI();
        } catch (err) {
            console.log('Auto-connect skipped', err);
        }

        provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                walletAddress = publicKey.toString();
            } else {
                walletAddress = null;
            }
            updateWalletUI();
            displayEvents();
        });
    }

    ensurePhantomBanner();
});

// === PREMIUM ASTEROID SYSTEM ===
function createAsteroids() {
    const body = document.body;
    const asteroidCount = 25;
    
    for (let i = 0; i < asteroidCount; i++) {
        const asteroid = document.createElement('div');
        asteroid.className = 'asteroid';
        
    // Premium size
        const sizes = [3, 4, 5, 6, 8];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        asteroid.style.width = size + 'px';
        asteroid.style.height = size + 'px';
        
    // Random position
        asteroid.style.left = Math.random() * 100 + 'vw';
        asteroid.style.top = Math.random() * 100 + 'vh';
        
    // Premium color
        const colors = [
            'var(--cosmic-gold)',
            'var(--cosmic-platinum)',
            'var(--cosmic-silver)',
            'var(--cosmic-amber)',
            'var(--comet-tail)'
        ];
        asteroid.style.background = colors[Math.floor(Math.random() * colors.length)];
        
    // Premium animation
        asteroid.style.animationDelay = Math.random() * 15 + 's';
        asteroid.style.animationDuration = (10 + Math.random() * 20) + 's';
        
    // Premium style
        asteroid.style.position = 'fixed';
        asteroid.style.pointerEvents = 'none';
        asteroid.style.zIndex = '-1';
        asteroid.style.opacity = '0.8';
        asteroid.style.boxShadow = `0 0 ${size * 2}px currentColor`;
        asteroid.style.borderRadius = '2px';
        asteroid.style.animation = 'asteroidDrift linear infinite';
        
        body.appendChild(asteroid);
    }
}

// Style for asteroids
const asteroidStyles = document.createElement('style');
asteroidStyles.textContent = `
    @keyframes asteroidDrift {
        0% {
            transform: translateX(-50px) translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.7;
        }
        90% {
            opacity: 0.7;
        }
        100% {
            transform: translateX(50px) translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(asteroidStyles);

// Logo comet hover animation
(function initCometHover() {
    const logo = document.getElementById('cometLogo');
    if (!logo) return;
    let tailPulse;
    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'translateY(-2px) rotate(-3deg) scale(1.05)';
        logo.style.filter = 'drop-shadow(0 0 8px var(--cosmic-gold))';
        const tail = logo.querySelector('path[stroke^="url(#cometTailGradient)"]');
        if (tail) {
            let opacity = 0.6;
            tailPulse = setInterval(() => {
                opacity = opacity > 0.8 ? 0.5 : opacity + 0.05;
                tail.setAttribute('opacity', opacity.toFixed(2));
            }, 60);
        }
    });
    logo.addEventListener('mouseleave', () => {
        logo.style.transform = '';
        logo.style.filter = '';
        const tails = logo.querySelectorAll('path[stroke^="url(#cometTailGradient)"]');
        tails.forEach((t, i) => t.setAttribute('opacity', i === 0 ? '1' : '0.6'));
        if (tailPulse) clearInterval(tailPulse);
    });
})();

// Wallet account changes handled via the Phantom provider (see initialization)

// === NEW SIMPLE INTERFACE ===
let currentEventType = 'event';
let ticketTypes = [];

function selectEventType(type) {
    currentEventType = type;
    
    // Update UI
    document.querySelectorAll('.type-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Show/hide sections
    const ticketingSection = document.getElementById('ticketing-section');
    const crowdfundingSection = document.getElementById('crowdfunding-section');
    const submitText = document.getElementById('submit-text');
    
    if (type === 'event') {
        ticketingSection.classList.remove('hidden');
        crowdfundingSection.classList.add('hidden');
        submitText.textContent = 'Create event';
    } else {
        ticketingSection.classList.add('hidden');
        crowdfundingSection.classList.remove('hidden');
        submitText.textContent = 'Launch campaign';
    }
}

function addTicketType() {
    const container = document.getElementById('ticket-types');
    const ticketCount = container.children.length + 1;
    
    const ticketHTML = `
        <div class="ticket-type">
            <div class="form-row">
                <div class="form-group">
                    <label>Ticket type</label>
                    <input type="text" placeholder="Ticket ${ticketCount}" class="ticket-name">
                </div>
                <div class="form-group">
                    <label>Price (SOL)</label>
                    <input type="number" placeholder="1.0" step="0.01" min="0" class="ticket-price">
                </div>
                <div class="form-group">
                    <label>Available quantity</label>
                    <input type="number" placeholder="50" min="1" class="ticket-quantity">
                </div>
            </div>
            <div class="form-group">
                <label>Ticket description</label>
                <input type="text" placeholder="Benefits included with this ticket" class="ticket-description">
            </div>
            <button type="button" onclick="removeTicketType(this)" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 8px; font-size: 0.85rem;">Remove</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', ticketHTML);
}

function removeTicketType(button) {
    button.closest('.ticket-type').remove();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showMessage('createMessages', 'error', 'Image size must be under 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('eventImage').value = e.target.result;
            const uploadArea = document.querySelector('.upload-area');
            uploadArea.innerHTML = `
                <span style="color: var(--cosmic-gold);">✅</span>
                <p style="color: var(--cosmic-platinum);">Image uploaded successfully</p>
                <small style="color: var(--cosmic-silver);">${file.name}</small>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// Simplified form handler
document.getElementById('eventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!walletAddress) {
        showMessage('createMessages', 'error', 'Please connect your wallet first');
        return;
    }

    const submitButton = document.querySelector('.btn-primary');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    // Validation
    const title = document.getElementById('eventTitle').value.trim();
    const org = document.getElementById('eventOrg').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    
    if (!title || !org || !description) {
        showMessage('createMessages', 'error', 'Please fill in all required fields');
        return;
    }

    // Gather data based on type
    const userWallet = document.getElementById('userWallet').value || walletAddress;
    let eventData = {
        id: Date.now().toString(),
        title,
        organization: org,
        description,
        imageUrl: document.getElementById('eventImage').value,
        date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        type: currentEventType,
        beneficiaryWallet: userWallet,
        creatorWallet: userWallet,
        raised: 0
    };

    if (currentEventType === 'event') {
          // Collect tickets
        const tickets = [];
        document.querySelectorAll('.ticket-type').forEach(ticketEl => {
            const name = ticketEl.querySelector('.ticket-name').value;
            const price = parseFloat(ticketEl.querySelector('.ticket-price').value);
            const quantity = parseInt(ticketEl.querySelector('.ticket-quantity').value);
            const description = ticketEl.querySelector('.ticket-description').value;
            
            if (name && price >= 0 && quantity > 0) {
                tickets.push({ name, price, quantity, description, sold: 0 });
            }
        });
        
        if (tickets.length === 0) {
            showMessage('createMessages', 'error', 'Please add at least one ticket type');
            return;
        }
        
        eventData.tickets = tickets;
        eventData.goal = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
    } else {
        // Crowdfunding
        const goal = parseFloat(document.getElementById('fundingGoal').value);
        const minContribution = parseFloat(document.getElementById('minContribution').value) || 0.1;
        const fundingType = document.querySelector('input[name="fundingType"]:checked').value;
        
        if (!goal || goal <= 0) {
            showMessage('createMessages', 'error', 'Please set a valid funding goal');
            return;
        }
        
        eventData.goal = goal;
        eventData.minContribution = minContribution;
        eventData.fundingType = fundingType;
    }

    try {
        // UI Loading
        submitText.classList.add('hidden');
        submitLoading.classList.remove('hidden');
        submitButton.disabled = true;
        
          // Simulate creation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
          // Add to events
        events.unshift(eventData);
        saveEvents();
        
        showMessage('createMessages', 'success', `✅ ${currentEventType === 'event' ? 'Event' : 'Campaign'} "${title}" created successfully!`);
        
        // Reset form
        document.getElementById('eventForm').reset();
        selectEventType('event');
        
        // Redirection
        setTimeout(() => {
            showSection('explore');
            showMessage('createMessages', '', '');
            showMessage('exploreMessages', 'success', `✅ ${currentEventType === 'event' ? 'Event' : 'Campaign'} "${title}" created successfully!`);
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('createMessages', 'error', 'Error during creation: ' + error.message);
    } finally {
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
        submitButton.disabled = false;
    }
});

// Initialize asteroids
createAsteroids();

// === TICKET MANAGEMENT ===
function showTickets(eventId) {
    if (!walletAddress) {
        showMessage('exploreMessages', 'info', 'Connect your wallet to purchase tickets');
    }
    const id = parseInt(eventId, 10);
    const event = events.find(e => e.id === id);
    if (!event || !event.tickets) return;

    // Create the modal if it doesn't exist
    let modal = document.getElementById('ticketModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticketModal';
        modal.className = 'ticket-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title" id="modalTitle"></div>
                    <button class="modal-close" onclick="closeTicketModal()">&times;</button>
                </div>
                <div id="ticketOptions"></div>
                <div id="selectedTicketInfo"></div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="buyTicketBtn" onclick="buyTicket()" disabled>
                        Buy ticket
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Populate the modal
    document.getElementById('modalTitle').textContent = `Tickets - ${event.title}`;
    
    const ticketOptionsHtml = event.tickets.map((ticket, index) => {
        const available = ticket.quantity - (ticket.sold || 0);
        const isAvailable = available > 0;
        
        return `
            <div class="ticket-option ${!isAvailable ? 'disabled' : ''}" onclick="${isAvailable ? `selectTicket(${index})` : ''}" data-ticket="${index}">
                <div class="ticket-header">
                    <div class="ticket-title">${ticket.name}</div>
                    <div class="ticket-cost">${formatSOL(ticket.price)} SOL</div>
                </div>
                <div class="ticket-desc">${ticket.description}</div>
                <div class="ticket-availability">
                    ${available > 0 ? `${available} tickets available` : 'Sold out'}
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('ticketOptions').innerHTML = ticketOptionsHtml;
    document.getElementById('selectedTicketInfo').innerHTML = '';
    document.getElementById('buyTicketBtn').disabled = true;
    
    // Show the modal
    modal.classList.add('show');
    
    // Global variables for selection
    window.selectedEvent = event;
    window.selectedTicketIndex = null;
    window.selectedQuantity = 1;
}

function selectTicket(ticketIndex) {
    // Remove previous selection
    document.querySelectorAll('.ticket-option').forEach(opt => opt.classList.remove('selected'));
    
    // Select the new ticket
    document.querySelector(`[data-ticket="${ticketIndex}"]`).classList.add('selected');
    
    const ticket = window.selectedEvent.tickets[ticketIndex];
    const available = ticket.quantity - (ticket.sold || 0);
    
    window.selectedTicketIndex = ticketIndex;
    window.selectedQuantity = 1;
    
    // Show quantity options
    document.getElementById('selectedTicketInfo').innerHTML = `
        <div class="quantity-selector">
            <span class="quantity-label">Quantity:</span>
            <input type="number" class="quantity-input" value="1" min="1" max="${available}" 
                   onchange="updateQuantity(this.value)" id="quantityInput">
        </div>
        <div class="total-display">
            <div class="total-amount" id="totalAmount">${formatSOL(ticket.price)} SOL</div>
        </div>
    `;
    
    document.getElementById('buyTicketBtn').disabled = false;
}

function updateQuantity(quantity) {
    const qty = Math.max(1, Math.min(parseInt(quantity) || 1, window.selectedEvent.tickets[window.selectedTicketIndex].quantity - (window.selectedEvent.tickets[window.selectedTicketIndex].sold || 0)));
    window.selectedQuantity = qty;
    
    document.getElementById('quantityInput').value = qty;
    
    const ticket = window.selectedEvent.tickets[window.selectedTicketIndex];
    const total = ticket.price * qty;
    document.getElementById('totalAmount').textContent = formatSOL(total) + ' SOL';
}

async function buyTicket() {
    if (!walletAddress) {
        showMessage('exploreMessages', 'error', 'Please connect your wallet first');
        await connectWallet();
        if (!walletAddress) return;
    }
    if (window.selectedTicketIndex === null) return;

    const event = window.selectedEvent;
    const ticket = event.tickets[window.selectedTicketIndex];
    const total = ticket.price * window.selectedQuantity;

    try {
        const confirmed = await customConfirm(
            `Confirm purchase:\n\n` +
            `Event: ${event.title}\n` +
            `Ticket: ${ticket.name}\n` +
            `Quantity: ${window.selectedQuantity}\n` +
            `Total: ${formatSOL(total)} SOL`
        );

        if (!confirmed) return;

        const btn = document.getElementById('buyTicketBtn');
        btn.innerHTML = 'Signing...';
        btn.disabled = true;

        provider = provider || getProvider();
        if (!provider) throw new Error('Wallet not connected');
        connection = connection || new solanaWeb3.Connection(SOLANA_NETWORK, 'confirmed');

        const lamports = Math.round(total * solanaWeb3.LAMPORTS_PER_SOL);
        // Pre-check buyer balance
        try {
            const buyerBalance = await connection.getBalance(new solanaWeb3.PublicKey(walletAddress));
            if (buyerBalance < lamports) {
                throw new Error('Insufficient funds');
            }
        } catch (e) {
            showMessage('exploreMessages', 'error', 'Insufficient SOL for this purchase');
            btn.innerHTML = 'Buy ticket';
            btn.disabled = false;
            return;
        }
        const signature = await payWithPhantom(event.beneficiaryWallet, lamports);

        btn.innerHTML = 'Verifying...';
        showMessage('exploreMessages', 'info', 'Payment sent. Verifying transaction...');

        const res = await fetch(`${API_BASE}/events/${event.id}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticketIndex: window.selectedTicketIndex,
                quantity: window.selectedQuantity,
                buyer: walletAddress,
                signature
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error');

        const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
        showMessage('exploreMessages', 'success', `✅ Purchased ${window.selectedQuantity} ${ticket.name} ticket(s) for "${event.title}" — <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer">View on Solana Explorer</a>`);
        closeTicketModal();
        loadEvents();

    } catch (error) {
        console.error('Purchase error:', error);
        if (error && (error.message?.includes('User rejected') || error.code === 4001)) {
            showMessage('exploreMessages', 'error', 'Signature declined');
        } else {
            showMessage('exploreMessages', 'error', 'Error during purchase: ' + error.message);
        }
        const btn = document.getElementById('buyTicketBtn');
        btn.innerHTML = 'Buy ticket';
        btn.disabled = false;
    }
}

function closeTicketModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close the modal by clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('ticketModal');
    if (modal && e.target === modal) {
        closeTicketModal();
    }
});

// Close the modal with the Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTicketModal();
    }
});

console.log('🚀 Evento Protocol - Ticketing version initialized');

