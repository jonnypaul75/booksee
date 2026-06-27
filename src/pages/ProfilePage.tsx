import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CURRENT_USER_ID,
  GenreDto,
  LanguageDto,
  SubscriptionDto,
  UpdateUserDto,
  UserDto,
  UserPreferenceDto,
  getActiveSubscription,
  getGenres,
  getLanguages,
  getPreferences,
  getUser,
  updateUser,
  upsertPreferences,
} from '../api';
import { useAsync } from '../hooks/useAsync';
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

const APP_VERSION = '1.0.0 (build 100)';

interface ProfilePageProps {
  onLogout: () => void;
}

type PanelId = null | 'details' | 'subscription' | 'preferences' | 'tnc' | 'privacy';

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const userQ = useAsync<UserDto>((s) => getUser(CURRENT_USER_ID, s), []);
  const prefsQ = useAsync<UserPreferenceDto>((s) => getPreferences(CURRENT_USER_ID, s), []);
  const subQ = useAsync<SubscriptionDto | null>(
    (s) => getActiveSubscription(CURRENT_USER_ID, s),
    []
  );

  // Local copies that get mutated via PUT on save.
  const [user, setUser] = useState<UserDto | null>(null);
  const [prefs, setPrefs] = useState<UserPreferenceDto | null>(null);

  // Hydrate local state when queries land.
  React.useEffect(() => { if (userQ.data) setUser(userQ.data); }, [userQ.data]);
  React.useEffect(() => { if (prefsQ.data) setPrefs(prefsQ.data); }, [prefsQ.data]);

  const [panel, setPanel] = useState<PanelId>(null);

  if (userQ.loading || !user) {
    return (
      <div className="bs-screen">
        <div className="bs-loader">Loading profile…</div>
      </div>
    );
  }

  if (userQ.error) {
    return (
      <div className="bs-screen">
        <div className="bs-no-results">Couldn't load profile. {userQ.error.message}</div>
      </div>
    );
  }

  return (
    <div className="bs-screen">
      <div className="bs-profile">
        <div className="bs-profile__card">
          <div className="bs-avatar">{(user.fullName[0] ?? 'U').toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <h3 className="bs-profile__name">{user.fullName}</h3>
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
              hint={subQ.data?.planName ?? 'No active plan'}
              onClick={() => navigate('/profile/subscription')}
            />
            <MenuItem
              icon={<SlidersIcon />}
              label="Preferences"
              hint={prefs ? `${prefs.defaultLanguage.toUpperCase()} · ${prefs.downloadQuality}` : '…'}
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

      {panel === 'details' && (
        <DetailsPanel
          user={user}
          onClose={() => setPanel(null)}
          onSaved={(u) => setUser(u)}
        />
      )}
      {panel === 'subscription' && (
        <SubscriptionPanel sub={subQ.data ?? null} onClose={() => setPanel(null)} />
      )}
      {panel === 'preferences' && prefs && (
        <PreferencesPanel
          prefs={prefs}
          onClose={() => setPanel(null)}
          onSaved={(p) => setPrefs(p)}
        />
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
}) => (
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

/* ---------- Slide-up panels ---------- */

interface PanelShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const PanelShell: React.FC<PanelShellProps> = ({ title, onClose, children, footer }) => (
  <div className="bs-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
    <div className="bs-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
      <div className="bs-modal__handle" />
      <h2 className="bs-modal__title">{title}</h2>
      <div>{children}</div>
      {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
    </div>
  </div>
);

const DetailsPanel: React.FC<{
  user: UserDto;
  onClose: () => void;
  onSaved: (u: UserDto) => void;
}> = ({ user, onClose, onSaved }) => {
  const [name, setName] = useState(user.fullName);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body: UpdateUserDto = { fullName: name };
      const updated = await updateUser(user.id, body);
      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelShell
      title="Personal Details"
      onClose={onClose}
      footer={
        <button
          disabled={saving}
          className="bs-action-pill"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 14,
            background: 'linear-gradient(145deg, var(--bs-red), var(--bs-orange))',
            border: 0,
            fontSize: 14,
            opacity: saving ? 0.7 : 1,
          }}
          onClick={save}
        >
          {saving ? 'Saving…' : 'Save Changes'}
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
          <input className="bs-field__input" value={user.email} disabled />
        </div>
      </div>
    </PanelShell>
  );
};

const SubscriptionPanel: React.FC<{ sub: SubscriptionDto | null; onClose: () => void }> = ({
  sub,
  onClose,
}) => (
  <PanelShell title="Payment & Subscription" onClose={onClose}>
    {sub ? (
      <div
        className="bs-glass"
        style={{
          padding: 18,
          background: 'linear-gradient(145deg, rgba(255,46,63,0.18), rgba(255,138,31,0.12))',
          border: '1px solid rgba(255,138,31,0.35)',
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--bs-text-dim)', letterSpacing: 0.5 }}>
          CURRENT PLAN
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{sub.planName}</div>
        <div style={{ fontSize: 12, color: 'var(--bs-text-dim)', marginTop: 4 }}>
          {sub.currency} {(sub.priceCents / 100).toFixed(2)} / {sub.billingPeriod}
        </div>
        <div style={{ fontSize: 12, color: 'var(--bs-text-dim)', marginTop: 4 }}>
          Renews on {new Date(sub.expiresAt).toLocaleDateString()}
        </div>
      </div>
    ) : (
      <div className="bs-glass" style={{ padding: 18 }}>
        <div style={{ color: 'var(--bs-text-dim)' }}>You're on the Free plan.</div>
      </div>
    )}
    <div className="bs-menu" style={{ marginTop: 14 }}>
      <div className="bs-menu__group">
        <MenuItem icon={<CreditCardIcon />} label="Manage Payment Methods" />
        <MenuItem icon={<FileTextIcon />} label="Billing History" />
        <MenuItem icon={<SlidersIcon />} label="Change Plan" />
      </div>
    </div>
  </PanelShell>
);

const PreferencesPanel: React.FC<{
  prefs: UserPreferenceDto;
  onClose: () => void;
  onSaved: (p: UserPreferenceDto) => void;
}> = ({ prefs, onClose, onSaved }) => {
  const langQ = useAsync<LanguageDto[]>((s) => getLanguages(s), []);
  const genreQ = useAsync<GenreDto[]>((s) => getGenres(s), []);

  const [local, setLocal] = useState<UserPreferenceDto>(prefs);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await upsertPreferences(CURRENT_USER_ID, local);
      onSaved(saved);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelShell
      title="Preferences"
      onClose={onClose}
      footer={
        <button
          disabled={saving}
          className="bs-action-pill"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 14,
            background: 'linear-gradient(145deg, var(--bs-red), var(--bs-orange))',
            border: 0,
            fontSize: 14,
            opacity: saving ? 0.7 : 1,
          }}
          onClick={save}
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      }
    >
      <div className="bs-glass" style={{ padding: 14, marginBottom: 12 }}>
        <div className="bs-row" style={{ marginBottom: 10 }}>
          <LanguageIcon size={18} style={{ color: 'var(--bs-orange)', marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>Default Language</span>
        </div>
        <div className="bs-chips" style={{ flexWrap: 'wrap' }}>
          {(langQ.data ?? []).map((l) => (
            <button
              key={l.code}
              className={`bs-chip ${l.code === local.defaultLanguage ? 'bs-chip--active' : ''}`}
              onClick={() => setLocal({ ...local, defaultLanguage: l.code })}
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
          {(genreQ.data ?? []).map((g) => (
            <button
              key={g.id}
              className={`bs-chip ${g.id === local.defaultGenreId ? 'bs-chip--active' : ''}`}
              onClick={() => setLocal({ ...local, defaultGenreId: g.id })}
            >
              {g.name}
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
}) => (
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

export default ProfilePage;
