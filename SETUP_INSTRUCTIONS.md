# CertChain - Setup Instructions
## Step-by-Step Guide to Get Everything Running

---

## ⚠️ Current Issue

You're seeing npm errors. This is likely because:
1. Node.js or npm is not properly installed
2. npm cache is corrupted
3. Package files are missing

---

## 🔧 Fix: Clear npm Cache and Reinstall

### **Step 1: Clear npm Cache**

Open PowerShell and run:

```powershell
npm cache clean --force
```

**Wait for it to complete** (may take 1-2 minutes)

---

### **Step 2: Delete node_modules Folders**

Run these commands one by one:

```powershell
# Delete root node_modules
Remove-Item -Recurse -Force node_modules

# Delete backend node_modules
Remove-Item -Recurse -Force backend\node_modules
```

---

### **Step 3: Reinstall Dependencies**

Run:

```powershell
npm install
```

**Wait for completion** (may take 3-5 minutes)

---

### **Step 4: Install Backend Dependencies**

Run:

```powershell
cd backend
npm install
cd ..
```

**Wait for completion**

---

## ✅ Verify Installation

After installation, check if everything is installed:

```powershell
npm list --depth=0
```

You should see:
- hardhat
- dotenv
- @nomicfoundation/hardhat-toolbox-viem

---

## 🚀 Now Run Commands

### **Terminal 1: Compile**

```powershell
npm run compile
```

Expected: `Compiled 1 Solidity file successfully`

---

### **Terminal 2: Run Tests**

```powershell
npm test
```

Expected: `✅ All tests completed!` (15 tests passing)

---

### **Terminal 3: Start Local Node**

```powershell
npm run node
```

Expected: `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`

**Keep this running!**

---

### **Terminal 4: Deploy**

```powershell
npm run deploy
```

Expected: `✅ Certificate deployed to: 0x...`

---

### **Terminal 5: Start Backend**

```powershell
npm run backend
```

Expected: `✅ Backend running on http://localhost:3000`

**Keep this running!**

---

## 📋 Troubleshooting

### If npm install still fails:

**Option 1: Use npm ci (clean install)**
```powershell
npm ci
```

**Option 2: Check Node.js version**
```powershell
node --version
npm --version
```

Should be:
- Node.js: v18 or higher
- npm: v9 or higher

**Option 3: Reinstall Node.js**
- Download from https://nodejs.org/
- Install LTS version
- Restart PowerShell
- Try again

---

## 🎯 Quick Checklist

- [ ] npm cache cleaned
- [ ] node_modules deleted
- [ ] npm install completed
- [ ] backend npm install completed
- [ ] npm run compile successful
- [ ] npm test all passing
- [ ] npm run node running
- [ ] npm run deploy successful
- [ ] npm run backend running
- [ ] Frontend accessible

---

## 📞 If Still Having Issues

1. **Check Node.js installation:**
   ```powershell
   node --version
   npm --version
   ```

2. **Check if ports are available:**
   ```powershell
   netstat -ano | findstr :8545
   netstat -ano | findstr :3000
   ```

3. **Try deleting package-lock.json:**
   ```powershell
   Remove-Item package-lock.json
   Remove-Item backend\package-lock.json
   npm install
   cd backend && npm install && cd ..
   ```

---

**Follow these steps carefully and everything should work! 🚀**

