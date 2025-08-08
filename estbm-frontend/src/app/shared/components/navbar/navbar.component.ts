import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  standalone: true,
  animations: [
    // Mobile menu animations
    trigger('slideInOut', [
      state('closed', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      state('open', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('closed <=> open', [
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    
    // User dropdown animations
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px) scale(0.95)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      })),
      transition('void <=> *', [
        animate('0.2s cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    
    // Hamburger menu animations
    trigger('hamburgerAnimation', [
      state('closed', style({})),
      state('open', style({})),
      transition('closed => open', [
        animate('0.3s ease-in-out', keyframes([
          style({ transform: 'rotate(0deg)', offset: 0 }),
          style({ transform: 'rotate(45deg)', offset: 0.5 }),
          style({ transform: 'rotate(45deg)', offset: 1 })
        ]))
      ]),
      transition('open => closed', [
        animate('0.3s ease-in-out', keyframes([
          style({ transform: 'rotate(45deg)', offset: 0 }),
          style({ transform: 'rotate(0deg)', offset: 0.5 }),
          style({ transform: 'rotate(0deg)', offset: 1 })
        ]))
      ])
    ]),
    
    // Active link indicator
    trigger('activeLink', [
      state('inactive', style({
        transform: 'scaleX(0)',
        opacity: 0
      })),
      state('active', style({
        transform: 'scaleX(1)',
        opacity: 1
      })),
      transition('inactive <=> active', [
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    
    // Brand logo hover animation
    trigger('logoHover', [
      state('normal', style({
        transform: 'scale(1) rotate(0deg)'
      })),
      state('hovered', style({
        transform: 'scale(1.1) rotate(5deg)'
      })),
      transition('normal <=> hovered', [
        animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('navbar') navbar!: ElementRef;
  
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  isScrolled = false;
  mobileMenuOpen = false;
  userMenuOpen = false;
  isLoading = false;
  logoHoverState = 'normal';
  
  // Animation states
  mobileMenuState = 'closed';
  userDropdownState = 'void';
  hamburgerState = 'closed';

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
      this.currentUser = user;
    });

    // Track route changes for active link highlighting
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveLink();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.navbar.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Close menus on Escape key
    if (event.key === 'Escape') {
      this.closeMenus();
    }
    
    // Handle arrow keys for navigation
    if (this.userMenuOpen) {
      this.handleKeyboardNavigation(event);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.mobileMenuState = this.mobileMenuOpen ? 'open' : 'closed';
    this.hamburgerState = this.mobileMenuOpen ? 'open' : 'closed';
    
    // Prevent body scroll when mobile menu is open
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.userDropdownState = this.userMenuOpen ? '*' : 'void';
  }

  closeMenus(): void {
    this.mobileMenuOpen = false;
    this.userMenuOpen = false;
    this.mobileMenuState = 'closed';
    this.userDropdownState = 'void';
    this.hamburgerState = 'closed';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileMenuState = 'closed';
    this.hamburgerState = 'closed';
  }

  onLogoHover(): void {
    this.logoHoverState = 'hovered';
  }

  onLogoLeave(): void {
    this.logoHoverState = 'normal';
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const menuItems = document.querySelectorAll('.dropdown-item');
    const currentIndex = Array.from(menuItems).findIndex(item => 
      item === document.activeElement
    );

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % menuItems.length;
        (menuItems[nextIndex] as HTMLElement).focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
        (menuItems[prevIndex] as HTMLElement).focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        (document.activeElement as HTMLElement).click();
        break;
    }
  }

  private updateActiveLink(): void {
    // Update active link indicator based on current route
    const currentRoute = this.router.url;
    // Implementation for active link highlighting
  }

  getDashboardRoute(): string {
    if (!this.currentUser) return '/login';
    
    switch (this.currentUser.role) {
      case 'ETUDIANT':
        return '/student/dashboard';
      case 'ENCADRANT':
        return '/encadrant/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  }

  getInitials(user: User | null): string {
    if (!user) return '?';
    return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(user: User | null): string {
    if (!user) return 'Utilisateur';
    return `${user.prenom} ${user.nom}`;
  }

  getRoleLabel(role: string | undefined): string {
    switch (role) {
      case 'ETUDIANT':
        return 'Étudiant';
      case 'ENCADRANT':
        return 'Encadrant';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  }

  getRoleBadgeColor(role: string | undefined): string {
    switch (role) {
      case 'ETUDIANT':
        return 'student';
      case 'ENCADRANT':
        return 'encadrant';
      case 'ADMIN':
        return 'admin';
      default:
        return 'default';
    }
  }

  async logout(event: Event): Promise<void> {
    event.preventDefault();
    this.isLoading = true;
    
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}