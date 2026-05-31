import React, { useState } from 'react';
import { Genre, UserProfile } from '../types';
import { APP_VERSION, GENRE_FILTERS, LANGUAGES } from '../data/mockData';
import {
  ChevronRightIcon,
  CreditCardIcon,
  FileTextIcon,
  InfoIcon,
  LanguageIcon,
  LogoutIcon,
  ShieldIcon,
  SlidersIcon,
  UserIcon,
} from '../components/Icons';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
}

type PanelId =
  | null
  | 'details'
  | 'subscription'
  | 'preferences'
  | 'tnc'
  | 'privacy';

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, onLogout }) => {
  const [panel, setPanel] = useState<PanelId>(null);

  return (
    <div className="bs-screen">
      <div className="bs-profile">
        <div className="bs-profile__card">
          <div className="bs-avatar">{user.avatarLetter}</div>
          <div style={{ flex: 1 }}>
            <h3 className="bs-profile__name">{user.name}</h3>
            <div className="bs-profile__email">{user.email}</div>
          </div>
        </div>

        <div className="bs-menu">
          <div className="bs-menu__group">
            <MenuItem
              icon={<UserIcon />}
              label="Personal details"
              onClick={() => setPanel('details')}
            />
            <MenuItem
              icon={<CreditCardIcon />}
              label="Payment & Subscription"
              hint={user.subscription.plan}
              onClick={() => setPanel('subscription')}
            />
            <MenuItem
              icon={<SlidersIcon />}
              label="Preferences"
              hint={`${prettyLang(user.defaultLanguage)} · ${user.defaultGenre}`}
              onClick={() => setPanel('preferences')}
            />
          </div>

          <div className="bs-menu__group">
            <MenuItem
              icon={<FileTextIcon />}
              label="Terms & Conditions"
              onClick={() => setPanel('tnc')}
            />
            <MenuItem
              icon={<ShieldIcon />}
              label="Privacy Policy"
              onClick={() => setPanel('privacy')}
            />
          </div>

          <div className="bs-menu__group">
            <MenuItem
              icon={<LogoutIcon />}
              label="Logout"
              danger
              onClick={onLogout}
              showChevron={false}
            />
          </div>

          <div className="bs-app-version">
            <InfoIcon size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            BookSee.App · v{APP_VERSION}
          </div>
        </div>
      </div>

      {/* Slide-up detail panels */}
      {panel === 'details' && (
        <DetailsPanel user={user} onClose={() => setPanel(null)} onSave={onUpdateUser} />
      )}
      {panel === 'subscription' && (
        <SubscriptionPanel user={user} onClose={() => setPanel(null)} />
      )}
      {panel === 'preferences' && (
        <PreferencesPanel user={user} onClose={() => setPanel(null)} onSave={onUpdateUser} />
      )}
      {panel === 'tnc' && (
        <DocPanel
          title="Terms & Conditions"
          onClose={() => setPanel(null)}
          body={`Welcome to BookSee.App. By using our service you agree to abide by the following terms… [Placeholder content. Replace with your final legal copy.]`}
        />
      )}
      {panel === 'privacy' && (
        <DocPanel
          title="Privacy Policy"
          onClose={() => setPanel(null)}
          body={`This Privacy Policy explains how BookSee.App collects, uses, and protects your information… [Placeholder content. Replace with your final legal copy.]`}
        />
      )}
    </div>
  );
};

/* ---------- Bits ---------- */

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  danger?: boolean;
  showChevron?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  hint,
  danger,
  showChevron = true,
  onClick,
}) => {
  return (
    <button className={`bs-menu__item ${danger ? 'bs-menu__danger' : ''}`} onClick={onClick}>
      <span className="bs-menu__icon">{icon}</span>
      <span className="bs-menu__label">{label}</span>
      {hint && (
        <span style={{ fontSize: 12, color: 'var(--bs-text-dim)', marginRight: 6 }}>{hint}</span>
      )}
      {showChevron && (
        <span className="bs-menu__chevron">
          <ChevronRightIcon size={18} />
        </span>
      )}
    </button>
  );
};

function prettyLang(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

/* ---------- Slide-up panels (reuses modal styles) ---------- */

interface PanelShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const PanelShell: React.FC<PanelShellProps> = ({ title, onClose, children, footer }) => {
  return (
    <div className="bs-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bs-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="bs-modal__handle" />
        <h2 className="bs-modal__title">{title}</h2>
        <div>{children}</div>
        {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
      </div>
    </div>
  );
};

const DetailsPanel: React.FC<{
  user: UserProfile;
  onClose: () => void;
  onSave: (u: UserProfile) => void;
}> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  return (
    <PanelShell
      title="Personal Details"
      onClose={onClose}
      footer={
        <button
          className="bs-action-pill"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 14,
            background: 'linear-gradient(145deg, var(--bs-red), var(--bs-orange))',
            border: 0,
            fontSize: 14,
          }}
          onClick={() => {
            onSave({ ...user, name, email, avatarLetter: (name[0] || 'U').toUpperCase() });
            onClose();
          }}
        >
          Save Changes
        </button>
      }
    >
      <div className="bs-glass" style={{ overflow: 'hidden' }}>
        <div className="bs-field">
          <span className="bs-field__label">Full Name</span>
          <input
            className="bs-field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="bs-field">
          <span className="bs-field__label">Email</span>
          <input
            className="bs-field__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
    </PanelShell>
  );
};

const SubscriptionPanel: React.FC<{ user: UserProfile; onClose: () => void }> = ({
  user,
  onClose,
}) => {
  return (
    <PanelShell title="Payment & Subscription" onClose={onClose}>
      <div
        className="bs-glass"
        style={{
          padding: 18,
          background:
            'linear-gradient(145deg, rgba(255,46,63,0.18), rgba(255,138,31,0.12))',
          border: '1px solid rgba(255,138,31,0.35)',
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--bs-text-dim)', letterSpacing: 0.5 }}>
          CURRENT PLAN
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
          {user.subscription.plan}
        </div>
        <div style={{ fontSize: 12, color: 'var(--bs-text-dim)', marginTop: 4 }}>
          Renews on {user.subscription.renewsOn}
        </div>
      </div>
      <div className="bs-menu" style={{ marginTop: 14 }}>
        <div className="bs-menu__group">
          <MenuItem icon={<CreditCardIcon />} label="Manage Payment Methods" />
          <MenuItem icon={<FileTextIcon />} label="Billing History" />
          <MenuItem icon={<SlidersIcon />} label="Change Plan" />
        </div>
      </div>
    </PanelShell>
  );
};

const PreferencesPanel: React.FC<{
  user: UserProfile;
  onClose: () => void;
  onSave: (u: UserProfile) => void;
}> = ({ user, onClose, onSave }) => {
  const [lang, setLang] = useState(user.defaultLanguage);
  const [genre, setGenre] = useState<Genre>(user.defaultGenre);
  return (
    <PanelShell
      title="Preferences"
      onClose={onClose}
      footer={
        <button
          className="bs-action-pill"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 14,
            background: 'linear-gradient(145deg, var(--bs-red), var(--bs-orange))',
            border: 0,
            fontSize: 14,
          }}
          onClick={() => {
            onSave({ ...user, defaultLanguage: lang, defaultGenre: genre });
            onClose();
          }}
        >
          Save Preferences
        </button>
      }
    >
      <div className="bs-glass" style={{ padding: 14, marginBottom: 12 }}>
        <div className="bs-row" style={{ marginBottom: 10 }}>
          <LanguageIcon size={18} style={{ color: 'var(--bs-orange)', marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>Default Language</span>
        </div>
        <div className="bs-chips" style={{ flexWrap: 'wrap' }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`bs-chip ${l.code === lang ? 'bs-chip--active' : ''}`}
              onClick={() => setLang(l.code)}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
      </div>

      <div className="bs-glass" style={{ padding: 14 }}>
        <div className="bs-row" style={{ marginBottom: 10 }}>
          <SlidersIcon size={18} style={{ color: 'var(--bs-orange)', marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>Default Genre</span>
        </div>
        <div className="bs-chips" style={{ flexWrap: 'wrap' }}>
          {GENRE_FILTERS.filter((g) => g !== 'All').map((g) => (
            <button
              key={g}
              className={`bs-chip ${g === genre ? 'bs-chip--active' : ''}`}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </PanelShell>
  );
};

const DocPanel: React.FC<{ title: string; body: string; onClose: () => void }> = ({
  title,
  body,
  onClose,
}) => {
  return (
    <PanelShell title={title} onClose={onClose}>
      <div
        className="bs-glass"
        style={{
          padding: 16,
          fontSize: 13,
          color: 'var(--bs-text-dim)',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}
      >
        {body}
      </div>
    </PanelShell>
  );
};

export default ProfilePage;
