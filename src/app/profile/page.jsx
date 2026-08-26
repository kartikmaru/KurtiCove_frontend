'use client'
import { useState, useEffect } from 'react'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { FiUser, FiMapPin, FiLock, FiTrash2, FiPlus } from 'react-icons/fi'

const emptyAddr = { fullName: '', mobile: '', pincode: '', addressLine: '', city: '', state: '' }

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('profile')

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', mobile: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  // Password form
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  // Address form
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [newAddr, setNewAddr] = useState(emptyAddr)
  const [savingAddr, setSavingAddr] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/user/get')
        if (res.data.success) {
          setUser(res.data.data)
          setProfileForm({ name: res.data.data.name, mobile: res.data.data.mobile || '' })
        }
      } catch {
        // silent — page will show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name) { toast.error('Name is required.'); return }
    setSavingProfile(true)
    try {
      const res = await API.put('/user/update-profile', profileForm)
      if (res.data.success) {
        setUser(res.data.data)
        localStorage.setItem('kc_user', JSON.stringify(res.data.data))
      }
    } catch { /* silent */ }
    finally { setSavingProfile(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('Passwords do not match.'); return
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.'); return
    }
    setSavingPwd(true)
    try {
      await API.patch('/user/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      })
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch { /* silent */ }
    finally { setSavingPwd(false) }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    const { fullName, mobile, pincode, addressLine, city, state } = newAddr
    if (!fullName || !mobile || !pincode || !addressLine || !city || !state) {
      toast.error('All address fields are required.'); return
    }
    setSavingAddr(true)
    try {
      const res = await API.post('/user/addaddresses', newAddr)
      if (res.data.success) {
        setUser((prev) => ({ ...prev, addresses: res.data.data }))
        setNewAddr(emptyAddr)
        setShowAddrForm(false)
      }
    } catch { /* silent */ }
    finally { setSavingAddr(false) }
  }

  const handleDeleteAddress = async (index) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await API.put('/user/deleteaddress', { index })
      if (res.data.success) {
        setUser((prev) => ({ ...prev, addresses: res.data.data }))
      }
    } catch { /* silent */ }
  }

  const tabs = [
    { key: 'profile', label: 'Profile', icon: FiUser },
    { key: 'addresses', label: 'Addresses', icon: FiMapPin },
    { key: 'password', label: 'Password', icon: FiLock },
  ]

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-[#FAF5FF] py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-cursive text-4xl font-bold text-[#3B0764] mb-8">My Profile</h1>

          {/* Avatar */}
          <div className="flex items-center gap-4 bg-white rounded-[16px] border border-[#E9D5FF] p-5 shadow-card mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A855F7] to-[#6B21A8] flex items-center justify-center text-white font-serif font-bold text-2xl flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#3B0764]">{user?.name}</h2>
              <p className="font-sans text-sm text-[#C084FC]">{user?.email}</p>
              <span className="inline-block mt-1 bg-[#F3E8FF] text-[#6B21A8] text-xs font-medium px-3 py-0.5 rounded-full capitalize">{user?.role}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#F3E8FF] rounded-xl p-1 mb-6">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium font-sans transition-all ${
                  tab === key ? 'bg-white text-[#3B0764] shadow-sm' : 'text-[#C084FC] hover:text-[#3B0764]'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card">
            {/* Profile Tab */}
            {tab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3B0764] mb-1 font-sans">Full Name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B0764] mb-1 font-sans">Mobile</label>
                  <input
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm((p) => ({ ...p, mobile: e.target.value }))}
                    placeholder="9876543210"
                    className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B0764] mb-1 font-sans">Email</label>
                  <input value={user?.email} disabled className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#C084FC] bg-[#F3E8FF] font-sans cursor-not-allowed" />
                  <p className="text-xs text-[#C084FC] mt-1 font-sans">Email cannot be changed</p>
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-sans font-semibold text-sm transition-all"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Addresses Tab */}
            {tab === 'addresses' && (
              <div className="space-y-4">
                {user?.addresses?.length === 0 && !showAddrForm && (
                  <p className="font-sans text-sm text-[#C084FC] text-center py-6">No saved addresses yet.</p>
                )}
                {user?.addresses?.map((addr, i) => (
                  <div key={i} className="p-4 bg-[#FAF5FF] rounded-xl border border-[#E9D5FF] flex justify-between items-start">
                    <div className="font-sans text-sm space-y-0.5">
                      <p className="font-semibold text-[#3B0764]">{addr.fullName}</p>
                      <p className="text-[#6B21A8] text-xs">{addr.mobile}</p>
                      <p className="text-[#6B21A8] text-xs">{addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}</p>
                    </div>
                    <button onClick={() => handleDeleteAddress(i)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}

                {showAddrForm && (
                  <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF5FF] rounded-xl border border-[#E9D5FF]">
                    {Object.keys(emptyAddr).map((key) => (
                      <div key={key} className={key === 'addressLine' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-[#3B0764] mb-1 capitalize font-sans">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                          value={newAddr[key]}
                          onChange={(e) => setNewAddr((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full border border-[#E9D5FF] rounded-xl px-3 py-2 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                          required
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex gap-2">
                      <button type="submit" disabled={savingAddr} className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-2 rounded-xl text-sm font-semibold font-sans transition-all">
                        {savingAddr ? 'Saving...' : 'Add Address'}
                      </button>
                      <button type="button" onClick={() => setShowAddrForm(false)} className="flex-1 border border-[#E9D5FF] text-[#3B0764] hover:bg-[#F3E8FF] py-2 rounded-xl text-sm font-semibold font-sans transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {!showAddrForm && (
                  <button onClick={() => setShowAddrForm(true)} className="flex items-center gap-2 text-[#A855F7] hover:text-[#9333EA] text-sm font-medium font-sans transition-colors">
                    <FiPlus size={15} /> Add New Address
                  </button>
                )}
              </div>
            )}

            {/* Password Tab */}
            {tab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {[
                  { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
                  { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-[#3B0764] mb-1 font-sans">{field.label}</label>
                    <input
                      type="password"
                      value={pwdForm[field.key]}
                      onChange={(e) => setPwdForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                      required
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-sans font-semibold text-sm transition-all"
                >
                  {savingPwd ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
