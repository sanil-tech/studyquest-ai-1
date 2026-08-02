/**
 * MVP Family Service simulating Base44 data relations.
 * Manages child profiles under a parent account.
 */
import { initializePilotStudent } from './pilotService';

const MOCK_CHILDREN_DB = [];
let activeChildSession = null;

export const createChildProfile = async (parentId, childDetails) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const newChild = {
    id: `child_${Date.now()}`,
    parentId,
    name: childDetails.name,
    level: childDetails.level, // e.g. "Tahun 1"
    curriculum: childDetails.curriculum, // e.g. "kssr_semakan"
    subject: childDetails.subject, // e.g. "matematik"
    onboardingCompleted: false,
    createdAt: new Date().toISOString()
  };

  MOCK_CHILDREN_DB.push(newChild);
  
  // Prepare the pilot student context for this child in the ecosystem
  await initializePilotStudent(newChild.id, newChild.name);

  return newChild;
};

export const getChildProfiles = async (parentId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_CHILDREN_DB.filter(c => c.parentId === parentId);
};

export const switchActiveChild = async (childId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const child = MOCK_CHILDREN_DB.find(c => c.id === childId);
  if (!child) throw new Error("Child profile not found.");
  
  activeChildSession = child;
  return child;
};

export const getActiveChild = () => {
  return activeChildSession;
};

export const completeChildOnboarding = async (childId) => {
  const child = MOCK_CHILDREN_DB.find(c => c.id === childId);
  if (child) {
    child.onboardingCompleted = true;
    if (activeChildSession?.id === childId) {
      activeChildSession.onboardingCompleted = true;
    }
  }
  return child;
};
