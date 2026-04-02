import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface ExpertiseTag {
  label: string;
}

interface Achievement {
  text: string;
}

interface InfoRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  themeService = inject(ThemeService);
  userName = 'Sarah Anderson';
  title = 'Founder & CEO at HealthFirst AI';
  location = 'San Francisco, CA';
  industry = 'HealthTech';
  description = 'Passionate entrepreneur building AI-powered solutions to democratize healthcare. 10+ years in healthcare technology with successful exits. Currently raising Series A to scale our platform.';
  contactLinks = [
    { label: 'sarah.a@healthfirst.ai', icon: '✉️' },
    { label: 'www.healthfirst.ai', icon: '🌐' },
    { label: 'LinkedIn', icon: 'in' },
    { label: 'Twitter', icon: '🐦' }
  ];

  expertise: ExpertiseTag[] = [
    { label: 'Healthcare' },
    { label: 'AI/ML' },
    { label: 'SaaS' },
    { label: 'B2B' }
  ];

  achievements: Achievement[] = [
    { text: 'Generated $2M ARR in first year' },
    { text: 'Partnered with 3 major hospital systems' },
    { text: 'Featured in TechCrunch and Forbes' },
    { text: '20,000+ active users' }
  ];

  companyOverview: InfoRow[] = [
    { label: 'Mission', value: 'Making quality healthcare accessible through AI-powered diagnostic tools and patient management systems.' },
    { label: 'Problem We Solve', value: 'Healthcare providers struggle with inefficient patient data management and delayed diagnoses. Our AI platform reduces diagnosis time by 60%.' },
    { label: 'Target Market', value: 'Mid to large-sized hospital systems and healthcare networks across the United States.' }
  ];

  fundingInfo: InfoRow[] = [
    { label: 'Current Stage', value: 'Series A' },
    { label: 'Seeking', value: '$5M - $8M' },
    { label: 'Previous Funding', value: 'Seed Round: $1.2M (2023) - Led by XYZ Ventures' },
    { label: 'Use of Funds', value: 'Product development (40%), Sales & Marketing (35%), Team expansion (25%)' }
  ];
}
