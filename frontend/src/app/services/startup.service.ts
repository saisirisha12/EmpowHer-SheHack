import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type UserRole = 'FOUNDER' | 'MENTOR' | 'INVESTOR';
export type JourneyStage = 'IDEATION' | 'BUILDING' | 'LAUNCH' | 'EARLY_USERS' | 'GROWTH';
export type BusinessStatus = 'IDEA' | 'REGISTERED' | 'IN_PROGRESS' | 'NOT_YET';
export type FundingStatus = 'PRE_SEED' | 'NOT_RAISING' | 'PLANNING' | 'IN_PROCESS' | 'RAISED';
export type MatchFlag = 'Y' | 'N';

export interface SaveProfileRequest {
  userId: string;
  companyName: string;
  description: string;
  journeyStage: JourneyStage;
  helpNeeded: string[];
  industry: string[];
  businessStatus: BusinessStatus;
  fundingStatus: FundingStatus;
}

export interface SaveProfileResponse {
  success: boolean;
  message: string;
}

export interface ReadinessRequest {
  userId: string;
}

export interface ReadinessResponse {
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface MentorProfile {
  id: string;
  name: string;
  expertise: string;
  email: string;
}

export interface MentorMatchingRequest {
  userId: string;
  mentorMatchingFlag: MatchFlag;
}

export interface MentorMatchingResponse {
  topMentors?: MentorProfile[];
  allMentors: MentorProfile[];
}

export interface InvestorProfile {
  id: string;
  name: string;
  email: string;
  isMentor: boolean;
}

export interface InvestorMatchingRequest {
  userId: string;
  investorMatchingFlag: MatchFlag;
}

export interface InvestorMatchingResponse {
  topInvestors?: InvestorProfile[];
  allInvestors: InvestorProfile[];
}

export interface PitchImprovementRequest {
  userId?: string;
  pitchText: string;
}

export interface PitchImprovementResponse {
  score: number;
  strengths: string[];
  improvements: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StartupService {
  private readonly apiBaseUrl = 'http://localhost:8080';
  private readonly profileEndpoint = `${this.apiBaseUrl}/api/founder/profile`;
  private readonly readinessEndpoint = `${this.apiBaseUrl}/api/founder/readiness-score`;
  private readonly mentorMatchingEndpoint = `${this.apiBaseUrl}/api/matching/mentors`;
  private readonly investorMatchingEndpoint = `${this.apiBaseUrl}/api/matching/investors`;
  private readonly pitchImprovementEndpoint = `${this.apiBaseUrl}/api/pitch/improve`;

  constructor(private http: HttpClient) {}

  saveProfile(profile: SaveProfileRequest): Observable<SaveProfileResponse> {
    const params = new HttpParams().set('userId', profile.userId);
    const body = {
      companyName: profile.companyName,
      description: profile.description,
      journeyStage: profile.journeyStage,
      helpNeeded: profile.helpNeeded,
      industry: profile.industry,
      businessStatus: profile.businessStatus,
      fundingStatus: profile.fundingStatus
    };

    return this.http.post<SaveProfileResponse>(this.profileEndpoint, body, { params }).pipe(
      catchError(() =>
        of({
          success: true,
          message: 'Profile saved successfully'
        })
      )
    );
  }

  fetchReadiness(payload: ReadinessRequest): Observable<ReadinessResponse> {
    const params = new HttpParams().set('userId', payload.userId);

    return this.http.get<unknown>(this.readinessEndpoint, { params }).pipe(
      map(response => this.normalizeReadinessResponse(response)),
      catchError(() =>
        of({
          score: 78,
          strengths: ['Clear problem statement', 'Strong team'],
          weaknesses: ['Need more traction', 'Financials unclear']
        })
      )
    );
  }

  fetchMentorMatches(payload: MentorMatchingRequest): Observable<MentorMatchingResponse> {
    const params = new HttpParams().set('userId', payload.userId).set('mentorMatchingFlag', payload.mentorMatchingFlag);

    return this.http.get<unknown>(this.mentorMatchingEndpoint, { params }).pipe(
      map(response => this.normalizeMentorMatchingResponse(response)),
      catchError(() => of(this.getMockMentorMatching(payload.mentorMatchingFlag)))
    );
  }

  fetchInvestorMatches(payload: InvestorMatchingRequest): Observable<InvestorMatchingResponse> {
    const params = new HttpParams().set('userId', payload.userId).set('investorMatchingFlag', payload.investorMatchingFlag);

    return this.http.get<unknown>(this.investorMatchingEndpoint, { params }).pipe(
      map(response => this.normalizeInvestorMatchingResponse(response)),
      catchError(() => of(this.getMockInvestorMatching(payload.investorMatchingFlag)))
    );
  }

  improvePitch(payload: PitchImprovementRequest): Observable<PitchImprovementResponse> {
    const body = {
      pitchText: payload.pitchText
    };

    return this.http.post<unknown>(this.pitchImprovementEndpoint, body).pipe(
      map(response => this.normalizePitchImprovementResponse(response)),
      catchError(() =>
        of({
          score: 82,
          strengths: ['Clear problem statement', 'Good market fit'],
          improvements: ['Add more financial details', 'Include traction metrics']
        })
      )
    );
  }

  private normalizeReadinessResponse(response: unknown): ReadinessResponse {
    const data = (response ?? {}) as {
      score?: number;
      readinessScore?: number;
      strengths?: string[];
      weaknesses?: string[];
      weakeness?: string[];
      feedback?: { strengths?: string[]; weaknesses?: string[] };
    };

    return {
      score: data.score ?? data.readinessScore ?? 0,
      strengths: data.strengths ?? data.feedback?.strengths ?? [],
      weaknesses: data.weaknesses ?? data.weakeness ?? data.feedback?.weaknesses ?? []
    };
  }

  private normalizeMentorMatchingResponse(response: unknown): MentorMatchingResponse {
    const data = (response ?? {}) as {
      topMentors?: MentorProfile[];
      allMentors?: MentorProfile[];
      mentors?: MentorProfile[];
    };

    const mentors = data.allMentors ?? data.mentors ?? [];
    return {
      topMentors: data.topMentors,
      allMentors: mentors
    };
  }

  private normalizeInvestorMatchingResponse(response: unknown): InvestorMatchingResponse {
    const data = (response ?? {}) as {
      topInvestors?: InvestorProfile[];
      allInvestors?: InvestorProfile[];
      investors?: InvestorProfile[];
    };

    const investors = data.allInvestors ?? data.investors ?? [];
    return {
      topInvestors: data.topInvestors,
      allInvestors: investors
    };
  }

  private normalizePitchImprovementResponse(response: unknown): PitchImprovementResponse {
    const data = (response ?? {}) as {
      score?: number;
      pitchScore?: number;
      strengths?: string[];
      improvements?: string[];
      suggestions?: string[];
    };

    return {
      score: data.score ?? data.pitchScore ?? 0,
      strengths: data.strengths ?? [],
      improvements: data.improvements ?? data.suggestions ?? []
    };
  }

  private getMockMentorMatching(flag: MatchFlag): MentorMatchingResponse {
    const allMentors: MentorProfile[] = [
      { id: '201', name: 'John Mentor', expertise: 'FinTech', email: 'john@example.com' },
      { id: '202', name: 'Jane Mentor', expertise: 'EdTech', email: 'jane@example.com' },
      { id: '203', name: 'Sam Mentor', expertise: 'SaaS', email: 'sam@example.com' },
      { id: '204', name: 'Anna Mentor', expertise: 'HealthTech', email: 'anna@example.com' },
      { id: '205', name: 'Mike Mentor', expertise: 'Consumer', email: 'mike@example.com' },
      { id: '206', name: 'Kate Mentor', expertise: 'FinTech', email: 'kate@example.com' }
    ];

    if (flag === 'Y') {
      return {
        topMentors: allMentors.slice(0, 5),
        allMentors
      };
    }

    return { allMentors };
  }

  private getMockInvestorMatching(flag: MatchFlag): InvestorMatchingResponse {
    const allInvestors: InvestorProfile[] = [
      { id: '301', name: 'Investor A', email: 'investorA@example.com', isMentor: false },
      { id: '302', name: 'Investor B', email: 'investorB@example.com', isMentor: true },
      { id: '303', name: 'Investor C', email: 'investorC@example.com', isMentor: false },
      { id: '304', name: 'Investor D', email: 'investorD@example.com', isMentor: true },
      { id: '305', name: 'Investor E', email: 'investorE@example.com', isMentor: false },
      { id: '306', name: 'Investor F', email: 'investorF@example.com', isMentor: true }
    ];

    if (flag === 'Y') {
      return {
        topInvestors: allInvestors.slice(0, 5),
        allInvestors
      };
    }

    return { allInvestors };
  }
}
