'use client'
import { useState, useEffect } from 'react'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { User, MapPin, Lock, Trash2, Plus } from 'lucide-react'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'
const CARD     = '#FFFAF5'

/* Account pages use Cormorant Garamond for an editorial serif feel */
const ACCT_SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif'

const emptyAddr = { fullName: '', mobile: '', pincode: '', addressLine: '', city: '', state: '' }

function InputField({ label, value, onChange, placeholder, disabled, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 font-sans" style={{ color: BERRY }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className="w-full border rounded-xl px-4 py-2.5 text-sm font-sans outline-none transition-all"
        style={{ borderColor: BORDER, color: disabled ? PINK : BERRY, background: disabled ? PEACH_LT : CARD, cursor: disabled ? 'not-allowed' : 'text' }}
        onFocus={(e)  => { if (!disabled) { e.target.style.borderColor = ROSE; e.target.style.boxShadow = `0 0 0 3px ${ROSE}22` } }}
        onBlur={(e)   => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

export default function ProfilePage() {
  const [user,          setUser]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [tab,           setTab]           = useState('profile')
  const [profileForm,   setProfileForm]   = useState({ name: '', mobile: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [pwdForm,       setPwdForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPwd,     setSavingPwd]     = useState(false)
  const [showAddrForm,  setShowAddrForm]  = useState(false)
  const [newAddr,       setNewAddr]       = useState(emptyAddr)
  const [savingAddr,    setSavingAddr]    = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/user/get')
        if (res.data.success) {
          setUser(res.data.data)
          setProfileForm({ name: res.data.data.name, mobile: res.data.data.mobile || '' })
        }
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    fetchUser()
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name) { toast.error('Name is required.'); return }
    setSavingProfile(true)
    try {
      const res = await API.put('/user/update-profile', profileForm)
      if (res.data.success) { setUser(res.data.data); localStorage.setItem('kc_user', JSON.stringify(res.data.data)); toast.success('Profile updated.') }
    } catch { /* silent */ } finally { setSavingProfile(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match.'); return }
    if (pwdForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    setSavingPwd(true)
    try {
      await API.patch('/user/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
      toast.success('Password changed.')
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch { /* silent */ } finally { setSavingPwd(false) }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    const { fullName, mobile, pincode, addressLine, city, state } = newAddr
    if (!fullName || !mobile || !pincode || !addressLine || !city || !state) { toast.error('All address fields are required.'); return }
    setSavingAddr(true)
    try {
      const res = await API.post('/user/addaddresses', newAddr)
      if (res.data.success) { setUser((p) => ({ ...p, addresses: res.data.data })); setNewAddr(emptyAddr); setShowAddrForm(false); toast.success('Address added.') }
    } catch { /* silent */ } finally { setSavingAddr(false) }
  }

  const handleDeleteAddress = async (index) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await API.put('/user/deleteaddress', { index })
      if (res.data.success) setUser((p) => ({ ...p, addresses: res.data.data }))
    } catch { /* silent */ }
  }

  const TABS = [
    { key: 'profile',   label: 'Profile',   Icon: User   },
    { key: 'addresses', label: 'Addresses', Icon: MapPin  },
    { key: 'password',  label: 'Password',  Icon: Lock    },
  ]

  const SaveBtn = ({ saving, label, savingLabel }) => (
    <button type="submit" disabled={saving}
      className="text-white px-6 py-2.5 rounded-xl font-sans font-semibold text-sm transition-all disabled:opacity-60 hover:shadow-md"
      style={{ background: ROSE }}>
      {saving ? savingLabel : label}
    </button>
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
           style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-bold text-4xl mb-8" style={{ fontFamily: ACCT_SERIF, color: BERRY }}>
          My Profile
        </h1>

        {/* Avatar card */}
        <div className="flex items-center gap-4 bg-white rounded-[16px] p-5 shadow-card mb-6"
             style={{ border: `1px solid ${BORDER}` }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
               style={{ background: `linear-gradient(135deg, ${PINK}, ${ROSE})`, fontFamily: ACCT_SERIF }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: ACCT_SERIF, color: BERRY }}>{user?.name}</h2>
            <p className="font-sans text-sm" style={{ color: MAUVE }}>{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-3 py-0.5 rounded-full capitalize font-sans"
                  style={{ background: PEACH_LT, color: BERRY, border: `1px solid ${BORDER}` }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 mb-6" style={{ background: PEACH_LT }}>
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium font-sans transition-all"
              style={tab === key ? { background: 'white', color: BERRY, boxShadow: `0 1px 4px rgba(224,92,136,0.15)` } : { color: PINK }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `1px solid ${BORDER}` }}>

          {tab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <InputField label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} />
              <InputField label="Mobile" value={profileForm.mobile} placeholder="9876543210" onChange={(e) => setProfileForm(p => ({ ...p, mobile: e.target.value }))} />
              <InputField label="Email" value={user?.email || ''} disabled onChange={() => {}} />
              <p className="text-xs font-sans" style={{ color: PINK }}>Email cannot be changed</p>
              <SaveBtn saving={savingProfile} label="Save Changes" savingLabel="Saving…" />
            </form>
          )}

          {tab === 'addresses' && (
            <div className="space-y-4">
              {user?.addresses?.length === 0 && !showAddrForm && (
                <p className="font-sans text-sm text-center py-6" style={{ color: MAUVE }}>No saved addresses yet.</p>
              )}
              {user?.addresses?.map((addr, i) => (
                <div key={i} className="p-4 rounded-xl flex justify-between items-start"
                     style={{ background: PEACH_LT, border: `1px solid ${BORDER}` }}>
                  <div className="font-sans text-sm space-y-0.5">
                    <p className="font-semibold" style={{ color: BERRY }}>{addr.fullName}</p>
                    <p className="text-xs" style={{ color: MAUVE }}>{addr.mobile}</p>
                    <p className="text-xs" style={{ color: MAUVE }}>{addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(i)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {showAddrForm && (
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl"
                      style={{ background: PEACH_LT, border: `1px solid ${BORDER}` }}>
                  {Object.keys(emptyAddr).map((key) => (
                    <div key={key} className={key === 'addressLine' ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-semibold mb-1 capitalize font-sans" style={{ color: BERRY }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input value={newAddr[key]} onChange={(e) => setNewAddr(p => ({ ...p, [key]: e.target.value }))} required
                        className="w-full border rounded-xl px-3 py-2 text-sm font-sans outline-none transition-all"
                        style={{ borderColor: BORDER, color: BERRY, background: 'white' }}
                        onFocus={(e) => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = `0 0 0 2px ${ROSE}22` }}
                        onBlur={(e)  => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none' }} />
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex gap-2">
                    <button type="submit" disabled={savingAddr}
                      className="flex-1 text-white py-2 rounded-xl text-sm font-semibold font-sans transition-all disabled:opacity-60"
                      style={{ background: ROSE }}>{savingAddr ? 'Saving…' : 'Add Address'}</button>
                    <button type="button" onClick={() => setShowAddrForm(false)}
                      className="flex-1 border py-2 rounded-xl text-sm font-semibold font-sans transition-all"
                      style={{ borderColor: BORDER, color: BERRY }}>Cancel</button>
                  </div>
                </form>
              )}
              {!showAddrForm && (
                <button onClick={() => setShowAddrForm(true)}
                  className="flex items-center gap-2 text-sm font-medium font-sans transition-colors"
                  style={{ color: ROSE }}>
                  <Plus size={15} /> Add New Address
                </button>
              )}
            </div>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password', ph: 'Enter current password' },
                { key: 'newPassword',     label: 'New Password',     ph: 'Min 6 characters' },
                { key: 'confirmPassword', label: 'Confirm Password',  ph: 'Re-enter new password' },
              ].map((f) => (
                <InputField key={f.key} type="password" label={f.label} placeholder={f.ph}
                  value={pwdForm[f.key]} onChange={(e) => setPwdForm(p => ({ ...p, [f.key]: e.target.value }))} />
              ))}
              <SaveBtn saving={savingPwd} label="Change Password" savingLabel="Changing…" />
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
