import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ReadinessResponse, StartupService } from '../../services/startup.service';

interface DeckCard {
  title: string;
  version: string;
  status: string;
  slides: string;
  views: number;
  downloads: number;
  updated: string;
}

interface ActionCard {
  title: string;
  points: string;
}

interface SheroMessage {
  sender: 'assistant' | 'user';
  text: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  themeService = inject(ThemeService);
  private startupService = inject(StartupService);
  userName = 'Sarah Anderson';
  readiness = {
    score: 78,
    status: 'Strong',
    progress: '+12% this month'
  };
  strengths: string[] = [];
  weaknesses: string[] = [];
  showSheroModal = false;
  sheroDraft = '';
  sheroSending = false;
  sheroMessages: SheroMessage[] = [];
  sheroQuickActions = ['Create from scratch', 'Use a template', 'Improve existing deck'];

  metrics = [
    { label: 'Pitch Decks', value: '3' },
    { label: 'Total Views', value: '280' },
    { label: 'Downloads', value: '25' },
    { label: 'Network', value: '24' }
  ];

  deckCards: DeckCard[] = [
    {
      title: 'HealthFirst AI - Series A Pitch Deck',
      version: 'v3.2',
      status: 'Active',
      slides: '15 slides',
      views: 45,
      downloads: 12,
      updated: 'Last edited 2 days ago'
    },
    {
      title: 'HealthFirst AI - Investor One-Pager',
      version: 'v2.1',
      status: 'Active',
      slides: '1 slides',
      views: 28,
      downloads: 8,
      updated: 'Last edited 1 week ago'
    },
    {
      title: 'Q4 2025 Performance Report',
      version: 'v1.0',
      status: 'Draft',
      slides: '6 slides',
      views: 15,
      downloads: 5,
      updated: 'Last edited 2 weeks ago'
    }
  ];

  private readonly deckImageQueryMap: Record<string, string> = {
    health: 'healthcare,ai,startup,presentation',
    investor: 'investor,meeting,venture-capital,pitch',
    performance: 'analytics,data,charts,business-report'
  };

  templates = [
    {
      title: 'Series A Template',
      description: 'Perfect for scaling companies seeking growth capital',
      slides: '15 slides'
    },
    {
      title: 'Seed Round Template',
      description: 'Ideal for early-stage startups with MVP or traction',
      slides: '12 slides'
    },
    {
      title: 'One-Pager Template',
      description: 'Concise overview for initial investor conversations',
      slides: '1 slide'
    }
  ];

  selectedTemplate = this.templates[0];

  selectTemplate(template: { title: string; description: string; slides: string }) {
    this.selectedTemplate = template;
  }

  ngOnInit(): void {
    const storedReadiness = localStorage.getItem('readinessResult');
    if (!storedReadiness) {
      return;
    }

    try {
      const parsed = JSON.parse(storedReadiness) as ReadinessResponse & { weakeness?: string[] };
      this.readiness = {
        score: parsed.score,
        status: parsed.score >= 75 ? 'Strong' : parsed.score >= 55 ? 'Growing' : 'Early',
        progress: parsed.score >= 75 ? '+12% this month' : '+8% this month'
      };
      this.strengths = parsed.strengths ?? [];
      this.weaknesses = parsed.weaknesses ?? parsed.weakeness ?? [];
    } catch {
      // Keep default dashboard values when stored payload is invalid.
    }
  }

  useTemplate() {
    if (!this.selectedTemplate) {
      return;
    }

    const userId = localStorage.getItem('userId') ?? '123';
    const pitchText = `Template selected: ${this.selectedTemplate.title}. ${this.selectedTemplate.description}`;

    this.startupService.improvePitch({ userId, pitchText }).subscribe(response => {
      window.alert(
        `Selected ${this.selectedTemplate.title}. Pitch score: ${response.score}/100. Top improvement: ${response.improvements[0]}`
      );
    });
  }

  openSheroModal() {
    this.showSheroModal = true;
    this.sheroDraft = '';
    this.sheroMessages = [
      {
        sender: 'assistant',
        text:
          "How is your business doing today? I'm here to help you create an amazing pitch deck that impresses investors."
      }
    ];
  }

  closeSheroModal() {
    this.showSheroModal = false;
    this.sheroDraft = '';
  }

  useSheroQuickAction(action: string) {
    this.sheroDraft = action;
    this.sendSheroMessage();
  }

  sendSheroMessage() {
    const message = this.sheroDraft.trim();
    if (!message) {
      return;
    }

    this.sheroMessages.push({ sender: 'user', text: message });
    this.sheroDraft = '';

    const userId = localStorage.getItem('userId') ?? '123';
    this.sheroSending = true;
    this.startupService.improvePitch({ userId, pitchText: message }).subscribe({
      next: response => {
        const topImprovements = response.improvements.slice(0, 3).join(' ');
        const assistantText = `Current pitch score: ${response.score}/100. ${topImprovements}`;
        this.sheroMessages.push({ sender: 'assistant', text: assistantText });
        this.sheroSending = false;
      },
      error: () => {
        this.sheroMessages.push({
          sender: 'assistant',
          text: 'I could not fetch suggestions right now. Please try again in a few seconds.'
        });
        this.sheroSending = false;
      }
    });
  }

  actionCards: ActionCard[] = [
    { title: 'Add Financial Projections to Pitch Deck', points: '+8 points' },
    { title: 'Record Video Pitch Presentation', points: '+6 points' },
    { title: 'Connect with 5 Investors', points: '+8 points' },
    { title: 'Update Market Analysis Section', points: '+5 points' }
  ];

  contentPerformance = [
    { title: 'Series A Pitch Deck', metric: '45 views · 12 downloads', growth: '+23% This week', color: '#8b5cf6' },
    { title: 'Investor One-Pager', metric: '28 views · 8 downloads', growth: '+15% This week', color: '#ec4899' },
    { title: 'Performance Report', metric: '15 views · 5 downloads', growth: '+8% This week', color: '#2563eb' }
  ];

  getDeckBackgroundImage(title: string): string {
    const query = this.resolveDeckImageQuery(title);
    return `url(https://source.unsplash.com/1600x900/?${encodeURIComponent(query)})`;
  }

  private resolveDeckImageQuery(title: string): string {
    const normalized = title.toLowerCase();

    if (normalized.includes('health') || normalized.includes('ai')) {
      return this.deckImageQueryMap['health'];
    }

    if (normalized.includes('investor') || normalized.includes('one-pager') || normalized.includes('one pager')) {
      return this.deckImageQueryMap['investor'];
    }

    if (normalized.includes('performance') || normalized.includes('report')) {
      return this.deckImageQueryMap['performance'];
    }

    const cleanedKeywords = title
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 2)
      .slice(0, 4)
      .join(',');

    return cleanedKeywords ? `${cleanedKeywords},startup,pitch` : 'startup,founder,pitch-deck';
  }
}
