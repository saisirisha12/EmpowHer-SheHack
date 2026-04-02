import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface CommunityPost {
  author: string;
  role: string;
  timestamp: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
})
export class CommunityComponent {
  themeService = inject(ThemeService);
  userName = 'Sarah Anderson';

  newPost = {
    title: '',
    body: ''
  };

  posts: CommunityPost[] = [
    {
      author: 'Maya Patel',
      role: 'Founder, Health Tech',
      timestamp: '2h ago',
      title: 'Seeking early-stage investor feedback',
      body: 'I’m refining our go-to-market section for a seed round. Anyone has examples of investor-friendly traction slides for a service-based startup?',
      likes: 18,
      comments: 6
    },
    {
      author: 'Ava Kim',
      role: 'CEO, FinGrowth',
      timestamp: '5h ago',
      title: 'Pitch deck question: how deep should the financial model go?',
      body: 'We have 3-year projections and a strong customer pipeline. Should we keep the model simple in the first deck or include detailed line items?',
      likes: 24,
      comments: 11
    }
  ];

  get totalLikes() {
    return this.posts.reduce((sum, post) => sum + post.likes, 0);
  }

  submitPost() {
    const title = this.newPost.title?.trim();
    const body = this.newPost.body?.trim();

    if (!title || !body) {
      return;
    }

    this.posts.unshift({
      author: this.userName,
      role: 'Founder, Wellness Studio',
      timestamp: 'Just now',
      title,
      body,
      likes: 0,
      comments: 0
    });

    this.newPost.title = '';
    this.newPost.body = '';
  }

  likePost(post: CommunityPost) {
    post.likes += 1;
  }
}
