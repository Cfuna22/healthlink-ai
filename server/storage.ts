import { 
  type User, 
  type InsertUser, 
  type HealthLog, 
  type InsertHealthLog,
  type ChatSession,
  type InsertChatSession,
  type SymptomAnalysis,
  type InsertSymptomAnalysis,
  type Clinic,
  type InsertClinic,
  type ClinicSearchResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Health log methods
  getHealthLogs(userId: string): Promise<HealthLog[]>;
  getHealthLogsByType(userId: string, type: string): Promise<HealthLog[]>;
  createHealthLog(log: InsertHealthLog): Promise<HealthLog>;
  deleteHealthLog(id: string): Promise<boolean>;

  // Chat session methods
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessions(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, messages: any): Promise<ChatSession | undefined>;

  // Symptom analysis methods
  getSymptomAnalyses(userId: string): Promise<SymptomAnalysis[]>;
  createSymptomAnalysis(analysis: InsertSymptomAnalysis & { analysis: any }): Promise<SymptomAnalysis>;

  // Clinic methods
  getClinics(): Promise<Clinic[]>;
  searchClinics(query: string, type?: string): Promise<Clinic[]>;
  getClinicsByLocation(latitude: number, longitude: number, radius: number): Promise<ClinicSearchResult[]>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private healthLogs: Map<string, HealthLog>;
  private chatSessions: Map<string, ChatSession>;
  private symptomAnalyses: Map<string, SymptomAnalysis>;
  private clinics: Map<string, Clinic>;

  constructor() {
    this.users = new Map();
    this.healthLogs = new Map();
    this.chatSessions = new Map();
    this.symptomAnalyses = new Map();
    this.clinics = new Map();
    
    // Initialize with some sample clinics
    this.initializeSampleClinics();
  }

  private initializeSampleClinics() {
    const sampleClinics = [
      {
        id: randomUUID(),
        name: "City Medical Center",
        address: "123 Main Street, Downtown",
        latitude: "40.7128",
        longitude: "-74.0060",
        type: "general",
        rating: 4,
        hours: "8 AM - 8 PM",
        phone: "(555) 123-4567",
        website: "https://citymedical.com",
      },
      {
        id: randomUUID(),
        name: "QuickCare Urgent Care",
        address: "456 Oak Avenue, Midtown",
        latitude: "40.7589",
        longitude: "-73.9851",
        type: "urgent",
        rating: 5,
        hours: "24/7",
        phone: "(555) 987-6543",
        website: "https://quickcare.com",
      },
      {
        id: randomUUID(),
        name: "Family Health Partners",
        address: "789 Pine Street, Westside",
        latitude: "40.7505",
        longitude: "-73.9934",
        type: "general",
        rating: 4,
        hours: "9 AM - 5 PM",
        phone: "(555) 456-7890",
        website: "https://familyhealth.com",
      },
    ];

    sampleClinics.forEach(clinic => this.clinics.set(clinic.id, clinic));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Health log methods
  async getHealthLogs(userId: string): Promise<HealthLog[]> {
    return Array.from(this.healthLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getHealthLogsByType(userId: string, type: string): Promise<HealthLog[]> {
    return Array.from(this.healthLogs.values())
      .filter(log => log.userId === userId && log.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createHealthLog(insertLog: InsertHealthLog): Promise<HealthLog> {
    const id = randomUUID();
    const log: HealthLog = {
      ...insertLog,
      id,
      userId: insertLog.userId || null,
      createdAt: new Date(),
    };
    this.healthLogs.set(id, log);
    return log;
  }

  async deleteHealthLog(id: string): Promise<boolean> {
    return this.healthLogs.delete(id);
  }

  // Chat session methods
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      userId: insertSession.userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: string, messages: any): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      messages,
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Symptom analysis methods
  async getSymptomAnalyses(userId: string): Promise<SymptomAnalysis[]> {
    return Array.from(this.symptomAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSymptomAnalysis(data: InsertSymptomAnalysis & { analysis: any }): Promise<SymptomAnalysis> {
    const id = randomUUID();
    const analysis: SymptomAnalysis = {
      ...data,
      id,
      userId: data.userId || null,
      createdAt: new Date(),
    };
    this.symptomAnalyses.set(id, analysis);
    return analysis;
  }

  // Clinic methods
  async getClinics(): Promise<Clinic[]> {
    return Array.from(this.clinics.values());
  }

  async searchClinics(query: string, type?: string): Promise<Clinic[]> {
    const clinics = Array.from(this.clinics.values());
    return clinics.filter(clinic => {
      const matchesQuery = clinic.name.toLowerCase().includes(query.toLowerCase()) ||
                          clinic.address.toLowerCase().includes(query.toLowerCase());
      const matchesType = !type || clinic.type === type;
      return matchesQuery && matchesType;
    });
  }

  async getClinicsByLocation(latitude: number, longitude: number, radius: number): Promise<ClinicSearchResult[]> {
    const clinics = Array.from(this.clinics.values());
    
    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return clinics
      .map(clinic => ({
        clinic,
        distance: calculateDistance(
          latitude,
          longitude,
          parseFloat(clinic.latitude),
          parseFloat(clinic.longitude)
        )
      }))
      .filter(result => result.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  async createClinic(insertClinic: InsertClinic): Promise<Clinic> {
    const id = randomUUID();
    const clinic: Clinic = { ...insertClinic, id };
    this.clinics.set(id, clinic);
    return clinic;
  }
}

export const storage = new MemStorage();
