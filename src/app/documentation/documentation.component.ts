import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { marked } from 'marked';

@Component({
  selector: 'documentation',
  standalone: true,
  imports: [CommonModule, NgbNavModule],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss'
})
export class DocumentationComponent implements OnInit {
  private http = inject(HttpClient);

  activeTab = 'overview';
  showScrollTop = false;
  renderedHtml = '';
  loading = false;

  tabs: { id: string; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'architecture', label: 'Architecture', icon: 'architecture' },
    { id: 'frontend', label: 'Frontend (UI)', icon: 'frontend' },
    { id: 'backend', label: 'Backend (API)', icon: 'backend' },
    { id: 'database', label: 'Database', icon: 'database' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'api', label: 'API Reference', icon: 'api' },
    { id: 'status', label: 'Build Status', icon: 'status' }
  ];

  // Last updated timestamp
  lastUpdated = 'February 8, 2026';

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 400;
  }

  ngOnInit() {
    this.loadTab(this.activeTab);
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
    this.loadTab(tabId);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadTab(tabId: string) {
    this.loading = true;
    this.renderedHtml = '';
    this.http.get(`assets/docs/${tabId}.md`, { responseType: 'text' }).subscribe({
      next: (markdown) => {
        this.renderedHtml = this.parseMarkdown(markdown);
        this.loading = false;
      },
      error: () => {
        this.renderedHtml = '<p class="doc-text text-muted">Documentation not found.</p>';
        this.loading = false;
      }
    });
  }

  private parseMarkdown(markdown: string): string {
    // Split on H1 headers to create card sections
    const sections = markdown.split(/^# /m).filter(s => s.trim());
    
    return sections.map(section => {
      const newlineIndex = section.indexOf('\n');
      const title = section.substring(0, newlineIndex).trim();
      const body = section.substring(newlineIndex + 1).trim();

      const htmlBody = marked.parse(body, { async: false }) as string;

      return `<div class="card doc-card">
        <div class="card-header"><h2 class="card-title">${title}</h2></div>
        <div class="card-body doc-markdown">${htmlBody}</div>
      </div>`;
    }).join('\n');
  }
}
