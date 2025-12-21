
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input, Textarea, Button } from '../ui';
import { Camera } from 'lucide-react';
import CVPlaceholder from '../../assets/images/cv-placeholder.svg';

interface ProfileFormProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  setAvatarFile: (file: File | null) => void;
  avatarPreview: string | null;
  setAvatarPreview: (preview: string | null) => void;
  handleSaveChanges: () => void;
  isSaving: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  bio,
  setBio,
  isPublic,
  setIsPublic,
  setAvatarFile,
  avatarPreview,
  setAvatarPreview,
  handleSaveChanges,
  isSaving,
}) => {
  const { user: authUser } = useAuth();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <div className="space-y-6">
       <div className="relative w-24 h-24 mx-auto">
        <img
          src={avatarPreview || authUser.photoURL || CVPlaceholder}
          alt="Profile"
          className="w-full h-full rounded-full border-2 border-accent/50 object-cover"
        />
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer text-white opacity-0 hover:opacity-100 transition-opacity"
        >
          <Camera size={24} />
          <input
            id="avatar-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your First Name"
        />
        <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Your Last Name"
        />
      </div>
      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell us a little about yourself..."
        rows={4}
      />
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
        <div>
            <h3 className="font-medium text-white">Make Profile Public</h3>
            <p className="text-sm text-gray-400">Allow other users to see your profile.</p>
        </div>
        <button
          onClick={() => setIsPublic(!isPublic)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
            isPublic ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
