/**
 * MVP Auth Service simulating Base44 Authentication.
 * Manages parent accounts.
 */

// Simulated local storage for MVP pilot
const MOCK_DB = {
  parents: []
};

let currentSession = null;

export const registerParent = async (details) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const existing = MOCK_DB.parents.find(p => p.email === details.email);
  if (existing) {
    throw new Error("Email already registered");
  }

  const newParent = {
    id: `parent_${Date.now()}`,
    name: details.name,
    email: details.email,
    password: details.password, // Simulated raw storage
    createdAt: new Date().toISOString()
  };

  MOCK_DB.parents.push(newParent);
  currentSession = { user: newParent, token: `sim_token_${newParent.id}` };

  return currentSession;
};

export const loginParent = async (email, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const parent = MOCK_DB.parents.find(p => p.email === email && p.password === password);
  
  if (!parent) {
    throw new Error("Invalid credentials");
  }

  currentSession = { user: parent, token: `sim_token_${parent.id}` };
  return currentSession;
};

export const logoutParent = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  currentSession = null;
  return true;
};

export const getCurrentSession = () => {
  return currentSession;
};
