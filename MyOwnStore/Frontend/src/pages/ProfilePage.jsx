import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Edit3,
  Camera,
  Calendar,
  Shield,
  Plus,
  Trash2
} from 'lucide-react'
import { authAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'

const ProfilePage = () => {
  // ===== HOOKS =====
  const { state, actions } = useApp()
  const navigate = useNavigate()
  const authCheckRef = useRef(false) // Prevent multiple auth checks
  const mountedRef = useRef(true) // Track if component is mounted

  // ===== STATE =====
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [authChecked, setAuthChecked] = useState(false) // Track auth check status

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: []
  })

  // Password data state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // ===== CONSTANTS =====
  const emptyAddress = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  }

  // ===== CLEANUP =====
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // ===== AUTH CHECK (ONLY ONCE) =====
  useEffect(() => {
    if (authCheckRef.current || authChecked) return // Prevent multiple runs

    const checkAuth = async () => {
      if (!mountedRef.current) return

      try {
        authCheckRef.current = true
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        
        console.log('Auth check - Token:', !!token, 'User:', !!user)
        
        if (!token || !user) {
          console.log('No auth data, redirecting to login')
          navigate('/login', { replace: true })
          return
        }

        // Test API call
        const response = await authAPI.getProfile()
        console.log('Profile fetch successful')
        
        if (mountedRef.current && response.data.success) {
          setAuthChecked(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (error.response?.status === 401) {
          actions.logout()
          navigate('/login', { replace: true })
        }
      }
    }

    checkAuth()
  }, []) // Empty dependency array - run only once

  // ===== INITIALIZE PROFILE DATA =====
  useEffect(() => {
    if (state.user && authChecked) {
      console.log('Initializing profile data')
      setProfileData({
        name: state.user.name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        address: state.user.address && state.user.address.length > 0
          ? state.user.address
          : [{ ...emptyAddress }]
      })
    }
  }, [state.user, authChecked]) // Only depend on user and auth check status

  // ===== HANDLERS =====

  const handleProfileChange = useCallback((field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleAddressChange = useCallback((index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      address: prev.address.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      )
    }))
  }, [])

  const addAddress = useCallback(() => {
    setProfileData(prev => ({
      ...prev,
      address: [...prev.address, { ...emptyAddress }]
    }))
  }, [emptyAddress])

  const removeAddress = useCallback((index) => {
    if (profileData.address.length > 1) {
      setProfileData(prev => ({
        ...prev,
        address: prev.address.filter((_, i) => i !== index)
      }))
    }
  }, [profileData.address.length])

  const handlePasswordChange = useCallback((field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSaveProfile = async () => {
    if (!mountedRef.current) return

    try {
      setIsLoading(true)

      const updateData = {
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        address: profileData.address.filter(addr =>
          addr.street && addr.city && addr.state && addr.postalCode && addr.country
        )
      }

      console.log('Updating profile with:', updateData)

      const response = await authAPI.updateProfile(updateData)

      if (!mountedRef.current) return

      console.log('Profile update response:', response.data)

      if (response.data.success) {
        // Only update the user data, don't trigger auth checks
        actions.updateUser(response.data.data.user)
        actions.setSuccess('Profile updated successfully!')
        setIsEditing(false)
        
        // Update local state without triggering effects
        setProfileData(prev => ({
          ...prev,
          name: response.data.data.user.name,
          phone: response.data.data.user.phone,
          address: response.data.data.user.address && response.data.data.user.address.length > 0 
            ? response.data.data.user.address 
            : [{ ...emptyAddress }]
        }))
      }
    } catch (error) {
      if (!mountedRef.current) return

      console.error('Profile update error:', error)
      const errorMessage = error.response?.data?.message
      actions.setError(errorMessage || 'Failed to update profile')
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  const handleChangePassword = async () => {
    if (!mountedRef.current) return

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      actions.setError('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      actions.setError('Password must be at least 6 characters long')
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(passwordData.newPassword)) {
      actions.setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      return
    }

    try {
      setIsLoading(true)

      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (!mountedRef.current) return

      if (response.data.success) {
        actions.setSuccess('Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      if (!mountedRef.current) return

      console.error('Password change error:', error)
      if (error.response?.status === 401) {
        actions.setError('Current password is incorrect')
      } else {
        actions.setError(error.response?.data?.message || 'Failed to change password')
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  const handleCancelPasswordChange = useCallback(() => {
    setIsChangingPassword(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }, [])

  // ===== HELPERS =====

  const calculateProfileCompletion = useCallback(() => {
    let completed = 0
    let total = 4

    if (profileData.name) completed++
    if (profileData.phone) completed++
    if (profileData.address.some(addr => addr.street && addr.city && addr.state && addr.postalCode)) completed++
    completed++ // Email is always present

    return Math.round((completed / total) * 100)
  }, [profileData])

  // ===== EARLY RETURNS =====

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    )
  }

  // Not authenticated
  if (!state.user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
        <Button onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  // ===== RENDER =====

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-12 w-12 text-primary-600" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:shadow-md transition-shadow">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {profileData.name || 'User'}
                </h3>
                <p className="text-gray-600 mb-2">{profileData.email}</p>

                <div className="flex justify-center mb-4">
                  <Badge variant="secondary" className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {state.user?.role === 'admin' ? 'Admin Account' : 'Verified Account'}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Member since {new Date(state.user?.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Profile Completion</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{calculateProfileCompletion()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProfileCompletion()}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Complete your profile to enable full functionality
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    disabled={true}
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Addresses
                </CardTitle>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAddress}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.address.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {index === 0 ? 'Primary Address' : `Address ${index + 1}`}
                      </h4>
                      {isEditing && profileData.address.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAddress(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <Input
                          value={address.street}
                          onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                          disabled={!isEditing}
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <Input
                          value={address.city}
                          onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                          disabled={!isEditing}
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <Input
                          value={address.state}
                          onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                          disabled={!isEditing}
                          placeholder="NY"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <Input
                          value={address.postalCode}
                          onChange={(e) => handleAddressChange(index, 'postalCode', e.target.value)}
                          disabled={!isEditing}
                          placeholder="10001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          value={address.country}
                          onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="IN">India</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading || !profileData.name.trim()}
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  Change Password
                </Button>
              </CardHeader>
              <CardContent>
                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleCancelPasswordChange}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
                      >
                        {isLoading ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Change Password
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">Password</p>
                      <p className="text-xs text-gray-500">
                        Keep your account secure with a strong password
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">••••••••••••</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage