import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import {
  BusinessStatus,
  FundingStatus,
  JourneyStage,
  ReadinessRequest,
  SaveProfileRequest,
  StartupService
} from '../../services/startup.service';

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private startupService = inject(StartupService);

  loading = false;
  error = '';
  buildProgress = 10;
  profileReady = false;
  progressDone = false;
  private progressTimerId: ReturnType<typeof setInterval> | null = null;
  showWelcomeChoice = true;
  hasExistingProfile = !!localStorage.getItem('startupProfile');
  currentStep = 0;
  stepCount = 3;
  stepTitles = [
    'Tell us about your startup',
    'Help needs & industry',
    'Business status'
  ];

  readonly fallbackReadiness = {
    score: 78,
    status: 'Strong',
    progress: '+12% this month'
  };

  journeyOptions = [
    { value: 'ideation', label: 'Ideation — Still figuring out the problem/solution' },
    { value: 'building', label: 'Building — MVP in development, no users yet' },
    { value: 'launch', label: 'Launch — Ready to share with first users' },
    { value: 'early', label: 'Early users — 1-100 customers/users' },
    { value: 'growth', label: 'Growth — Scaling, 100+ customers' }
  ];

  helpOptions = [
    'Build my pitch deck — Need help creating investor materials',
    'Find a mentor — Looking for guidance & accountability',
    'Connect with investors — Ready to raise funding',
    'Get traction — Need advice on acquiring users',
    'Build my team — Need help hiring or co-founder advice'
  ];

  industryOptions = ['FinTech', 'HealthTech', 'EdTech', 'SaaS / B2B', 'Consumer / B2C', 'Other'];

  fundingOptions = [
    { value: 'not-raising', label: 'Not raising yet' },
    { value: 'planning', label: 'Planning to raise soon' },
    { value: 'in-process', label: 'Currently in process of raising' },
    { value: 'raised', label: 'Already raised! (bootstrapped, friends/family, angel, seed, etc.)' }
  ];

  registrationOptions = [
    { value: 'registered', label: 'Yes — Registered / Has EIN / BOI filed' },
    { value: 'in-progress', label: 'In progress — Planning to register soon' },
    { value: 'not-yet', label: 'Not yet — Still in ideation phase' }
  ];

  form = this.fb.group({
    companyName: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(200)]],
    journey: ['', Validators.required],
    helpAreas: this.fb.array([], Validators.required),
    industries: this.fb.array([], Validators.required),
    otherIndustry: [''],
    fundingStatus: ['', Validators.required],
    registrationStatus: ['', Validators.required]
  });

  get helpAreas(): FormArray {
    return this.form.get('helpAreas') as FormArray;
  }

  get industries(): FormArray {
    return this.form.get('industries') as FormArray;
  }

  get isOtherIndustrySelected(): boolean {
    return this.industries.value.includes('Other');
  }

  toggleHelpArea(option: string) {
    const index = this.helpAreas.value.indexOf(option);
    if (index === -1) {
      this.helpAreas.push(this.fb.control(option));
    } else {
      this.helpAreas.removeAt(index);
    }
  }

  toggleIndustry(option: string) {
    const index = this.industries.value.indexOf(option);
    if (index === -1) {
      this.industries.push(this.fb.control(option));
    } else {
      this.industries.removeAt(index);
    }
  }

  isIndustrySelected(option: string) {
    return this.industries.value.includes(option);
  }

  touchCurrentStepControls() {
    if (this.currentStep === 0) {
      this.form.controls.companyName.markAsTouched();
      this.form.controls.description.markAsTouched();
      this.form.controls.journey.markAsTouched();
    }

    if (this.currentStep === 1) {
      this.helpAreas.markAllAsTouched();
      this.industries.markAllAsTouched();
      if (this.isOtherIndustrySelected) {
        this.form.controls.otherIndustry.markAsTouched();
      }
    }

    if (this.currentStep === 2) {
      this.form.controls.fundingStatus.markAsTouched();
      this.form.controls.registrationStatus.markAsTouched();
    }
  }

  canContinue(): boolean {
    if (this.currentStep === 0) {
      return this.form.controls.companyName.valid && this.form.controls.description.valid && this.form.controls.journey.valid;
    }

    if (this.currentStep === 1) {
      const industriesValid = this.industries.length > 0;
      const otherIndustryValid = !this.isOtherIndustrySelected || !!this.form.controls.otherIndustry.value?.trim();
      return this.helpAreas.length > 0 && industriesValid && otherIndustryValid;
    }

    if (this.currentStep === 2) {
      return this.form.controls.fundingStatus.valid && this.form.controls.registrationStatus.valid;
    }

    return false;
  }

  nextStep() {
    this.error = '';
    this.touchCurrentStepControls();

    if (this.currentStep < this.stepCount - 1) {
      if (!this.canContinue()) {
        return;
      }
      this.currentStep++;
      return;
    }

    this.submit();
  }

  startQuestionnaire() {
    this.showWelcomeChoice = false;
    this.error = '';
  }

  skipToDashboard() {
    this.router.navigate(['dashboard']);
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submit() {
    this.touchCurrentStepControls();

    if (!this.canContinue()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.buildProgress = 10;
    this.profileReady = false;
    this.progressDone = false;
    this.startProgressAnimation();

    const userId = localStorage.getItem('userId') ?? '123';
    const payload: SaveProfileRequest = {
      userId,
      companyName: this.form.controls.companyName.value ?? '',
      description: this.form.controls.description.value ?? '',
      journeyStage: this.toJourneyStage(this.form.controls.journey.value ?? ''),
      helpNeeded: this.getHelpNeededCodes(),
      industry: this.getIndustryCodes(),
      businessStatus: this.toBusinessStatus(this.form.controls.registrationStatus.value ?? ''),
      fundingStatus: this.toFundingStatus(this.form.controls.fundingStatus.value ?? '')
    };

    const readinessPayload: ReadinessRequest = {
      userId
    };

    this.startupService
      .saveProfile(payload)
      .pipe(switchMap(() => this.startupService.fetchReadiness(readinessPayload)))
      .subscribe({
        next: readiness => {
          localStorage.setItem('startupProfile', JSON.stringify(payload));
          localStorage.setItem('readinessResult', JSON.stringify(readiness));
          this.profileReady = true;
          this.completeIfReady();
        },
        error: (err: unknown) => {
          this.stopProgressAnimation();
          this.loading = false;
          this.error = err instanceof Error ? err.message : 'Failed to save your profile. Please try again.';
        }
      });
  }

  private startProgressAnimation() {
    this.stopProgressAnimation();
    this.progressTimerId = setInterval(() => {
      if (this.buildProgress >= 100) {
        this.buildProgress = 100;
        this.progressDone = true;
        this.stopProgressAnimation();
        this.completeIfReady();
        return;
      }

      this.buildProgress += 5;
    }, 180);
  }

  private stopProgressAnimation() {
    if (this.progressTimerId) {
      clearInterval(this.progressTimerId);
      this.progressTimerId = null;
    }
  }

  private completeIfReady() {
    if (this.profileReady && this.progressDone) {
      this.loading = false;
      this.router.navigate(['dashboard']);
    }
  }

  private toJourneyStage(value: string): JourneyStage {
    const map: Record<string, JourneyStage> = {
      ideation: 'IDEATION',
      building: 'BUILDING',
      launch: 'LAUNCH',
      early: 'EARLY_USERS',
      growth: 'GROWTH'
    };

    return map[value] ?? 'BUILDING';
  }

  private toBusinessStatus(value: string): BusinessStatus {
    const map: Record<string, BusinessStatus> = {
      registered: 'REGISTERED',
      'in-progress': 'IN_PROGRESS',
      'not-yet': 'IDEA'
    };

    return map[value] ?? 'IDEA';
  }

  private toFundingStatus(value: string): FundingStatus {
    const map: Record<string, FundingStatus> = {
      'not-raising': 'NOT_RAISING',
      planning: 'PRE_SEED',
      'in-process': 'IN_PROCESS',
      raised: 'RAISED'
    };

    return map[value] ?? 'PRE_SEED';
  }

  private getHelpNeededCodes(): string[] {
    const normalizeHelpNeeded = (value: string): string => {
      const normalized = value.toLowerCase();

      if (normalized.includes('investor') || normalized.includes('funding')) {
        return 'FUNDING';
      }

      if (normalized.includes('mentor')) {
        return 'MENTORSHIP';
      }

      if (normalized.includes('traction') || normalized.includes('users')) {
        return 'NETWORKING';
      }

      if (normalized.includes('team') || normalized.includes('co-founder') || normalized.includes('hiring')) {
        return 'TEAM_BUILDING';
      }

      return 'PITCH';
    };

    return (this.helpAreas.value as string[]).map(normalizeHelpNeeded);
  }

  private getIndustryCodes(): string[] {
    const selectedIndustries = [...(this.industries.value as string[])];
    const otherIndustry = this.form.controls.otherIndustry.value?.trim();
    const mapIndustry = (value: string): string => {
      const normalized = value.toLowerCase();

      if (normalized.includes('fintech')) {
        return 'FINANCE';
      }

      if (normalized.includes('health')) {
        return 'HEALTHTECH';
      }

      if (normalized.includes('edtech')) {
        return 'EDTECH';
      }

      if (normalized.includes('saas') || normalized.includes('b2b')) {
        return 'TECH';
      }

      if (normalized.includes('consumer') || normalized.includes('b2c')) {
        return 'CONSUMER';
      }

      if (normalized.includes('ai')) {
        return 'AI_ML';
      }

      return 'TECH';
    };

    const baseIndustries = selectedIndustries
      .filter(industry => industry !== 'Other')
      .map(mapIndustry);

    if (selectedIndustries.includes('Other') && otherIndustry) {
      return [...baseIndustries, otherIndustry];
    }

    return baseIndustries;
  }
}
