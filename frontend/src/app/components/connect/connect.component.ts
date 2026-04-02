import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InvestorProfile, MentorProfile, StartupService } from '../../services/startup.service';
import { ThemeService } from '../../services/theme.service';

interface ContactProfile {
  name: string;
  role: string;
  location: string;
  focusAreas: string[];
  investments: number;
  initials: string;
}

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {
  themeService = inject(ThemeService);
  private startupService = inject(StartupService);
  userName = 'Sarah Anderson';
  contacts: ContactProfile[] = [];
  pendingContacts = new Set<string>();

  showModal = false;
  selectedContact: ContactProfile | null = null;
  noteText = '';
  sent = false;

  ngOnInit(): void {
    const userId = localStorage.getItem('userId') ?? '123';

    forkJoin({
      mentors: this.startupService.fetchMentorMatches({ userId, mentorMatchingFlag: 'Y' }),
      investors: this.startupService.fetchInvestorMatches({ userId, investorMatchingFlag: 'Y' })
    }).subscribe(({ mentors, investors }) => {
      const mentorCards = (mentors.topMentors ?? mentors.allMentors).map(mentor => this.mapMentorToContact(mentor));
      const investorCards = (investors.topInvestors ?? investors.allInvestors).map(investor =>
        this.mapInvestorToContact(investor)
      );

      this.contacts = [...mentorCards, ...investorCards];
    });
  }

  openModal(contact: ContactProfile) {
    this.selectedContact = contact;
    this.noteText = '';
    this.sent = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedContact = null;
    this.noteText = '';
    this.sent = false;
  }

  sendNote() {
    if (!this.noteText.trim()) {
      return;
    }
    this.sent = true;
    if (this.selectedContact) {
      this.pendingContacts.add(this.selectedContact.name);
    }
  }

  isContactPending(contactName: string): boolean {
    return this.pendingContacts.has(contactName);
  }

  private mapMentorToContact(mentor: MentorProfile): ContactProfile {
    return {
      name: mentor.name,
      role: 'Mentor',
      location: mentor.email,
      focusAreas: [mentor.expertise],
      investments: 0,
      initials: this.getInitials(mentor.name)
    };
  }

  private mapInvestorToContact(investor: InvestorProfile): ContactProfile {
    return {
      name: investor.name,
      role: investor.isMentor ? 'Investor & Mentor' : 'Investor',
      location: investor.email,
      focusAreas: [investor.isMentor ? 'Mentorship' : 'Funding'],
      investments: 0,
      initials: this.getInitials(investor.name)
    };
  }

  private getInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('');
  }
}
