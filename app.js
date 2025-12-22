// ==================== API Client ====================
const API_BASE_URL = window.location.origin;

class APIClient {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Auth
    async login(userid, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ userid, password })
        });
    }

    // Workers
    async getWorkers() {
        return this.request('/workers');
    }

    async addWorker(worker) {
        return this.request('/workers', {
            method: 'POST',
            body: JSON.stringify(worker)
        });
    }

    async updateWorker(id, worker) {
        return this.request(`/workers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(worker)
        });
    }

    async deleteWorker(id) {
        return this.request(`/workers/${id}`, { method: 'DELETE' });
    }

    // Production
    async getProduction() {
        return this.request('/production');
    }

    async addProduction(production) {
        return this.request('/production', {
            method: 'POST',
            body: JSON.stringify(production)
        });
    }

    async deleteProduction(date, brickId) {
        return this.request(`/production/${date}/${brickId}`, { method: 'DELETE' });
    }

    // Purchases
    async getPurchases() {
        return this.request('/purchases');
    }

    async addPurchase(purchase) {
        return this.request('/purchases', {
            method: 'POST',
            body: JSON.stringify(purchase)
        });
    }

    async deletePurchase(invoice) {
        return this.request(`/purchases/${invoice}`, { method: 'DELETE' });
    }

    // Supplies
    async getSupplies() {
        return this.request('/supplies');
    }

    async addSupply(supply) {
        return this.request('/supplies', {
            method: 'POST',
            body: JSON.stringify(supply)
        });
    }

    async deleteSupply(invoice) {
        return this.request(`/supplies/${invoice}`, { method: 'DELETE' });
    }

    // Accounts
    async getAccounts() {
        return this.request('/accounts');
    }

    async addAccount(account) {
        return this.request('/accounts', {
            method: 'POST',
            body: JSON.stringify(account)
        });
    }

    async deleteAccount(sno) {
        return this.request(`/accounts/${sno}`, { method: 'DELETE' });
    }

    // Utility
    async getBrickTypes() {
        return this.request('/brick-types');
    }

    async getDepartments() {
        return this.request('/departments');
    }
}

// ==================== App Manager ====================
class AppManager {
    constructor() {
        this.api = new APIClient();
        this.currentUser = null;
        this.currentSection = 'overview';
        this.cache = {
            brickTypes: [],
            departments: []
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStaticData();
        this.checkAuth();
    }

    async loadStaticData() {
        try {
            this.cache.brickTypes = await this.api.getBrickTypes();
            this.cache.departments = await this.api.getDepartments();
        } catch (error) {
            console.error('Failed to load static data:', error);
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Sidebar navigation
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });

        // Add buttons
        document.getElementById('addWorkerBtn').addEventListener('click', () => {
            this.showAddWorkerForm();
        });

        document.getElementById('addProductionBtn').addEventListener('click', () => {
            this.showAddProductionForm();
        });

        document.getElementById('addPurchaseBtn').addEventListener('click', () => {
            this.showAddPurchaseForm();
        });

        document.getElementById('addSupplyBtn').addEventListener('click', () => {
            this.showAddSupplyForm();
        });

        document.getElementById('addAccountBtn').addEventListener('click', () => {
            this.showAddAccountForm();
        });
    }

    checkAuth() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('loginError');

        try {
            const response = await this.api.login(username, password);

            if (response.success) {
                this.currentUser = response.user;
                sessionStorage.setItem('currentUser', JSON.stringify(response.user));
                errorEl.classList.remove('show');
                this.showDashboard();
            }
        } catch (error) {
            errorEl.textContent = 'Invalid username or password';
            errorEl.classList.add('show');
        }
    }

    handleLogout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('dashboardScreen').classList.remove('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('dashboardScreen').classList.add('active');
        document.getElementById('userName').textContent = `Welcome, ${this.currentUser.userid}`;
        this.navigateToSection('overview');
    }

    navigateToSection(section) {
        this.currentSection = section;

        // Update sidebar
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === section) {
                btn.classList.add('active');
            }
        });

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}Section`).classList.add('active');

        // Load section data
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        try {
            switch (section) {
                case 'overview':
                    await this.loadOverview();
                    break;
                case 'workers':
                    await this.loadWorkers();
                    break;
                case 'production':
                    await this.loadProduction();
                    break;
                case 'purchases':
                    await this.loadPurchases();
                    break;
                case 'supplies':
                    await this.loadSupplies();
                    break;
                case 'accounts':
                    await this.loadAccounts();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${section}:`, error);
            this.showError(`Failed to load ${section} data`);
        }
    }

    async loadOverview() {
        const [workers, production, purchases, supplies] = await Promise.all([
            this.api.getWorkers(),
            this.api.getProduction(),
            this.api.getPurchases(),
            this.api.getSupplies()
        ]);

        // Update stats
        document.getElementById('totalWorkers').textContent = workers.length;
        document.getElementById('totalProduction').textContent = production.length;
        document.getElementById('totalPurchases').textContent = purchases.length;
        document.getElementById('totalSupplies').textContent = supplies.length;

        // Load brick types
        const brickTypesEl = document.getElementById('brickTypesList');
        brickTypesEl.innerHTML = this.cache.brickTypes.map(brick => `
            <div class="brick-type-item">
                <span class="brick-type-name">${brick.brick_type}</span>
                <span class="brick-type-rate">₹${brick.rate_per_1000.toLocaleString()}/1000</span>
            </div>
        `).join('');

        // Load recent activity
        const activityEl = document.getElementById('activityList');
        const recentActivities = [
            ...workers.slice(0, 3).map(w => ({ text: `New worker: ${w.w_name}`, time: 'Recently' })),
            ...production.slice(0, 2).map(p => ({ text: `Production: ${p.brick_type}`, time: 'Recently' }))
        ].slice(0, 5);

        activityEl.innerHTML = recentActivities.length > 0
            ? recentActivities.map(activity => `
                <div class="activity-item">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `).join('')
            : '<div class="activity-item"><div class="activity-text text-muted">No recent activity</div></div>';
    }

    async loadWorkers() {
        const workers = await this.api.getWorkers();
        const tbody = document.getElementById('workersTableBody');

        tbody.innerHTML = workers.length > 0
            ? workers.map(worker => `
                <tr>
                    <td>${worker.worker_id}</td>
                    <td>${worker.w_name}</td>
                    <td>${worker.age}</td>
                    <td>${worker.gender}</td>
                    <td>${worker.dept}</td>
                    <td>₹${parseInt(worker.salary).toLocaleString()}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon-only" onclick="app.editWorker(${worker.worker_id})" title="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn-icon-only btn-delete" onclick="app.deleteWorker(${worker.worker_id})" title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : '<tr><td colspan="7" class="text-center text-muted">No workers found</td></tr>';
    }

    async loadProduction() {
        const production = await this.api.getProduction();
        const tbody = document.getElementById('productionTableBody');

        tbody.innerHTML = production.length > 0
            ? production.map(prod => `
                <tr>
                    <td>${prod.p_date}</td>
                    <td>${prod.brick_type}</td>
                    <td>${parseInt(prod.quantity).toLocaleString()}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon-only btn-delete" onclick="app.deleteProduction('${prod.p_date}', ${prod.brick_id})" title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : '<tr><td colspan="4" class="text-center text-muted">No production records found</td></tr>';
    }

    async loadPurchases() {
        const purchases = await this.api.getPurchases();
        const tbody = document.getElementById('purchasesTableBody');

        tbody.innerHTML = purchases.length > 0
            ? purchases.map(purchase => {
                const brick = this.cache.brickTypes.find(b => b.brick_id === parseInt(purchase.brick_id));
                return `
                    <tr>
                        <td>${purchase.invoice}</td>
                        <td>${purchase.p_date}</td>
                        <td>${purchase.p_name}</td>
                        <td>${brick ? brick.brick_type : 'N/A'}</td>
                        <td>${parseInt(purchase.quantity).toLocaleString()}</td>
                        <td>₹${parseInt(purchase.total_cost).toLocaleString()}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-icon-only btn-delete" onclick="app.deletePurchase(${purchase.invoice})" title="Delete">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="7" class="text-center text-muted">No purchase records found</td></tr>';
    }

    async loadSupplies() {
        const supplies = await this.api.getSupplies();
        const tbody = document.getElementById('suppliesTableBody');

        tbody.innerHTML = supplies.length > 0
            ? supplies.map(supply => `
                <tr>
                    <td>${supply.invoice}</td>
                    <td>${supply.location}</td>
                    <td>${supply.vehicle_no}</td>
                    <td>${supply.s_date}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon-only btn-delete" onclick="app.deleteSupply(${supply.invoice})" title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : '<tr><td colspan="5" class="text-center text-muted">No supply records found</td></tr>';
    }

    async loadAccounts() {
        const accounts = await this.api.getAccounts();
        const tbody = document.getElementById('accountsTableBody');

        tbody.innerHTML = accounts.length > 0
            ? accounts.map(account => `
                <tr>
                    <td>${account.s_no}</td>
                    <td>${account.a_date}</td>
                    <td>${account.description}</td>
                    <td class="text-accent">${account.credit ? '₹' + parseInt(account.credit).toLocaleString() : '-'}</td>
                    <td style="color: #EF4444">${account.debit ? '₹' + parseInt(account.debit).toLocaleString() : '-'}</td>
                    <td><strong>₹${parseInt(account.balance).toLocaleString()}</strong></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon-only btn-delete" onclick="app.deleteAccount(${account.s_no})" title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : '<tr><td colspan="7" class="text-center text-muted">No account records found</td></tr>';
    }

    // Modal functions
    openModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    showError(message) {
        alert(message); // You can replace this with a better notification system
    }

    // Worker forms
    showAddWorkerForm() {
        const form = `
            <form class="modal-form" id="workerForm">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" name="f_name" required placeholder="Enter first name">
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="l_name" required placeholder="Enter last name">
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="number" name="age" required placeholder="Enter age" min="18" max="65">
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select name="gender" required>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select name="dept" required>
                        <option value="">Select department</option>
                        ${this.cache.departments.map(d => `<option value="${d.dept_id}">${d.dept_name} (${d.dept_id})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Salary</label>
                    <input type="number" name="salary" required placeholder="Enter salary" min="0">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Worker</button>
                </div>
            </form>
        `;

        this.openModal('Add New Worker', form);

        document.getElementById('workerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const worker = Object.fromEntries(formData);

            try {
                await this.api.addWorker(worker);
                this.closeModal();
                await this.loadWorkers();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to add worker');
            }
        });
    }

    async editWorker(worker_id) {
        const workers = await this.api.getWorkers();
        const worker = workers.find(w => w.worker_id === worker_id);
        if (!worker) return;

        const form = `
            <form class="modal-form" id="editWorkerForm">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" name="f_name" required value="${worker.f_name}">
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="l_name" required value="${worker.l_name}">
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="number" name="age" required value="${worker.age}" min="18" max="65">
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select name="gender" required>
                        <option value="Male" ${worker.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${worker.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${worker.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select name="dept" required>
                        ${this.cache.departments.map(d => `<option value="${d.dept_id}" ${worker.dept == d.dept_id ? 'selected' : ''}>${d.dept_name} (${d.dept_id})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Salary</label>
                    <input type="number" name="salary" required value="${worker.salary}" min="0">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Worker</button>
                </div>
            </form>
        `;

        this.openModal('Edit Worker', form);

        document.getElementById('editWorkerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updates = Object.fromEntries(formData);

            try {
                await this.api.updateWorker(worker_id, updates);
                this.closeModal();
                await this.loadWorkers();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to update worker');
            }
        });
    }

    async deleteWorker(worker_id) {
        if (confirm('Are you sure you want to delete this worker?')) {
            try {
                await this.api.deleteWorker(worker_id);
                await this.loadWorkers();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to delete worker');
            }
        }
    }

    // Production forms
    showAddProductionForm() {
        const form = `
            <form class="modal-form" id="productionForm">
                <div class="form-group">
                    <label>Production Date</label>
                    <input type="date" name="p_date" required>
                </div>
                <div class="form-group">
                    <label>Brick Type</label>
                    <select name="brick_id" required>
                        <option value="">Select brick type</option>
                        ${this.cache.brickTypes.map(b => `<option value="${b.brick_id}">${b.brick_type} (₹${b.rate_per_1000}/1000)</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" name="quantity" required placeholder="Enter quantity" min="1">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Production</button>
                </div>
            </form>
        `;

        this.openModal('Add Production Record', form);

        document.getElementById('productionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const production = Object.fromEntries(formData);

            try {
                await this.api.addProduction(production);
                this.closeModal();
                await this.loadProduction();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to add production record');
            }
        });
    }

    async deleteProduction(p_date, brick_id) {
        if (confirm('Are you sure you want to delete this production record?')) {
            try {
                await this.api.deleteProduction(p_date, brick_id);
                await this.loadProduction();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to delete production record');
            }
        }
    }

    // Purchase forms
    showAddPurchaseForm() {
        const form = `
            <form class="modal-form" id="purchaseForm">
                <div class="form-group">
                    <label>Purchase Date</label>
                    <input type="date" name="p_date" required>
                </div>
                <div class="form-group">
                    <label>Purchaser Name</label>
                    <input type="text" name="p_name" required placeholder="Enter purchaser name">
                </div>
                <div class="form-group">
                    <label>Brick Type</label>
                    <select name="brick_id" required>
                        <option value="">Select brick type</option>
                        ${this.cache.brickTypes.map(b => `<option value="${b.brick_id}">${b.brick_type} (₹${b.rate_per_1000}/1000)</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" name="quantity" required placeholder="Enter quantity" min="1">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Purchase</button>
                </div>
            </form>
        `;

        this.openModal('Add Purchase Record', form);

        document.getElementById('purchaseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const purchase = Object.fromEntries(formData);

            try {
                await this.api.addPurchase(purchase);
                this.closeModal();
                await this.loadPurchases();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to add purchase record');
            }
        });
    }

    async deletePurchase(invoice) {
        if (confirm('Are you sure you want to delete this purchase record?')) {
            try {
                await this.api.deletePurchase(invoice);
                await this.loadPurchases();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to delete purchase record');
            }
        }
    }

    // Supply forms
    showAddSupplyForm() {
        this.api.getPurchases().then(purchases => {
            const form = `
                <form class="modal-form" id="supplyForm">
                    <div class="form-group">
                        <label>Invoice Number</label>
                        <select name="invoice" required>
                            <option value="">Select invoice</option>
                            ${purchases.map(p => `<option value="${p.invoice}">Invoice #${p.invoice} - ${p.p_name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Delivery Location</label>
                        <input type="text" name="location" required placeholder="Enter delivery location">
                    </div>
                    <div class="form-group">
                        <label>Vehicle Number</label>
                        <input type="text" name="vehicle_no" required placeholder="Enter vehicle number">
                    </div>
                    <div class="form-group">
                        <label>Supply Date</label>
                        <input type="date" name="s_date" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Supply</button>
                    </div>
                </form>
            `;

            this.openModal('Add Supply Record', form);

            document.getElementById('supplyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const supply = Object.fromEntries(formData);

                try {
                    await this.api.addSupply(supply);
                    this.closeModal();
                    await this.loadSupplies();
                    await this.loadOverview();
                } catch (error) {
                    this.showError('Failed to add supply record');
                }
            });
        });
    }

    async deleteSupply(invoice) {
        if (confirm('Are you sure you want to delete this supply record?')) {
            try {
                await this.api.deleteSupply(invoice);
                await this.loadSupplies();
                await this.loadOverview();
            } catch (error) {
                this.showError('Failed to delete supply record');
            }
        }
    }

    // Account forms
    showAddAccountForm() {
        const form = `
            <form class="modal-form" id="accountForm">
                <div class="form-group">
                    <label>Transaction Date</label>
                    <input type="date" name="a_date" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" name="description" required placeholder="Enter transaction description">
                </div>
                <div class="form-group">
                    <label>Credit Amount</label>
                    <input type="number" name="credit" placeholder="Enter credit amount" min="0" value="0">
                </div>
                <div class="form-group">
                    <label>Debit Amount</label>
                    <input type="number" name="debit" placeholder="Enter debit amount" min="0" value="0">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Transaction</button>
                </div>
            </form>
        `;

        this.openModal('Add Account Transaction', form);

        document.getElementById('accountForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const account = Object.fromEntries(formData);

            try {
                await this.api.addAccount(account);
                this.closeModal();
                await this.loadAccounts();
            } catch (error) {
                this.showError('Failed to add account transaction');
            }
        });
    }

    async deleteAccount(s_no) {
        if (confirm('Are you sure you want to delete this account record?')) {
            try {
                await this.api.deleteAccount(s_no);
                await this.loadAccounts();
            } catch (error) {
                this.showError('Failed to delete account record');
            }
        }
    }
}

// Initialize app
const app = new AppManager();
