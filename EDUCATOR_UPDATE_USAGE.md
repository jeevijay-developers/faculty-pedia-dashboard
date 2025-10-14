# Educator Update API Usage Guide

This guide shows how to use the educator update methods in the dashboard settings page.

## Available Methods in `util/server.js`

### 1. Update Basic Info (Name, Email, Mobile, Bio, Intro Video Link)
```javascript
updateEducatorBasicInfo(educatorId, data)
```

**Parameters:**
- `educatorId`: String - The educator's MongoDB ObjectId
- `data`: Object with optional fields:
  - `firstName`: String (5-30 chars)
  - `lastName`: String (5-30 chars)
  - `email`: String (valid email format)
  - `mobileNumber`: Number (10 digits)
  - `bio`: String (10-500 chars)
  - `introVideoLink`: String (valid URL, 5-500 chars)

**Example:**
```javascript
import { updateEducatorBasicInfo } from "@/util/server";

const handleUpdateBasicInfo = async () => {
  try {
    const response = await updateEducatorBasicInfo(educatorId, {
      firstName: "Abhishek",
      lastName: "Jewels",
      email: "teacher1@gmail.com",
      mobileNumber: "1245789632",
      bio: "Experienced educator with passion for teaching",
      introVideoLink: "https://youtu.be/tZ3ndrKQXN8?si=ckEPFZwUGJ_NhP_P"
    });
    console.log("Updated successfully:", response);
  } catch (error) {
    console.error("Update failed:", error);
  }
};
```

---

### 2. Update Profile Image
```javascript
updateEducatorImage(educatorId, imageFile)
```

**Parameters:**
- `educatorId`: String - The educator's MongoDB ObjectId
- `imageFile`: File object from input[type="file"]

**Example:**
```javascript
import { updateEducatorImage } from "@/util/server";

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const response = await updateEducatorImage(educatorId, file);
    console.log("Image updated:", response);
    // Update UI with new image URL: response.data.image.url
  } catch (error) {
    console.error("Image upload failed:", error);
  }
};
```

---

### 3. Update Work Experience
```javascript
updateEducatorWorkExperience(educatorId, workExperience)
```

**Parameters:**
- `educatorId`: String - The educator's MongoDB ObjectId
- `workExperience`: Array of objects with:
  - `title`: String (2-100 chars) - Job title
  - `company`: String (2-100 chars) - Company name
  - `startDate`: Date - Start date
  - `endDate`: Date - End date

**Example:**
```javascript
import { updateEducatorWorkExperience } from "@/util/server";

const handleUpdateWorkExperience = async () => {
  try {
    const response = await updateEducatorWorkExperience(educatorId, [
      {
        title: "Senior Physics Teacher",
        company: "ABC Institute",
        startDate: "2020-01-01T00:00:00.000Z",
        endDate: "2025-09-12T00:00:00.000Z"
      },
      {
        title: "Junior Teacher",
        company: "XYZ School",
        startDate: "2018-01-01T00:00:00.000Z",
        endDate: "2019-12-31T00:00:00.000Z"
      }
    ]);
    console.log("Work experience updated:", response);
  } catch (error) {
    console.error("Update failed:", error);
  }
};
```

---

### 4. Update Qualifications
```javascript
updateEducatorQualifications(educatorId, qualification)
```

**Parameters:**
- `educatorId`: String - The educator's MongoDB ObjectId
- `qualification`: Array of objects with:
  - `title`: String (2-100 chars) - Degree/Qualification name
  - `institute`: String (2-100 chars) - Institution name
  - `startDate`: Date - Start date
  - `endDate`: Date - End date

**Example:**
```javascript
import { updateEducatorQualifications } from "@/util/server";

const handleUpdateQualifications = async () => {
  try {
    const response = await updateEducatorQualifications(educatorId, [
      {
        title: "M.Sc Physics",
        institute: "Delhi University",
        startDate: "2015-07-01T00:00:00.000Z",
        endDate: "2017-06-30T00:00:00.000Z"
      },
      {
        title: "B.Sc Physics",
        institute: "Delhi University",
        startDate: "2012-07-01T00:00:00.000Z",
        endDate: "2015-06-30T00:00:00.000Z"
      }
    ]);
    console.log("Qualifications updated:", response);
  } catch (error) {
    console.error("Update failed:", error);
  }
};
```

---

### 5. Update Social Links
```javascript
updateEducatorSocialLinks(educatorId, socials)
```

**Parameters:**
- `educatorId`: String - The educator's MongoDB ObjectId
- `socials`: Object with optional fields (all must be valid URLs):
  - `linkedin`: String (5-200 chars)
  - `twitter`: String (5-200 chars)
  - `facebook`: String (5-200 chars)
  - `instagram`: String (5-200 chars)
  - `youtube`: String (5-200 chars)

**Example:**
```javascript
import { updateEducatorSocialLinks } from "@/util/server";

const handleUpdateSocialLinks = async () => {
  try {
    const response = await updateEducatorSocialLinks(educatorId, {
      linkedin: "https://linkedin.com/in/educator",
      twitter: "https://twitter.com/educator",
      facebook: "https://facebook.com/educator",
      instagram: "https://instagram.com/educator",
      youtube: "https://youtube.com/@educator"
    });
    console.log("Social links updated:", response);
  } catch (error) {
    console.error("Update failed:", error);
  }
};
```

---

### 6. Update Specialization and Experience
```javascript
updateEducatorSpecializationAndExperience(educatorId, data)
```

**Parameters:**
- `educatorId`: String - The educator's MongoDB ObjectId
- `data`: Object with:
  - `specialization`: String (enum: "Physics", "Chemistry", "Biology", "Mathematics", "IIT-JEE", "NEET", "CBSE")
  - `yearsExperience`: Number (minimum: 0)

**Example:**
```javascript
import { updateEducatorSpecializationAndExperience } from "@/util/server";

const handleUpdateSpecialization = async () => {
  try {
    const response = await updateEducatorSpecializationAndExperience(educatorId, {
      specialization: "IIT-JEE",
      yearsExperience: 10
    });
    console.log("Specialization updated:", response);
  } catch (error) {
    console.error("Update failed:", error);
  }
};
```

---

## Complete Settings Page Integration Example

```typescript
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  updateEducatorBasicInfo,
  updateEducatorImage,
  updateEducatorWorkExperience,
  updateEducatorQualifications,
  updateEducatorSocialLinks,
  updateEducatorSpecializationAndExperience,
  getCurrentEducator
} from "@/util/server";

export default function SettingsPage() {
  const { toast } = useToast();
  const [educatorId, setEducatorId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for profile data matching backend structure
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    bio: "",
    introVideoLink: "",
    specialization: "Physics",
    yearsExperience: 0,
  });

  const [workExperience, setWorkExperience] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    youtube: "",
  });

  // Fetch current educator data on mount
  useEffect(() => {
    const fetchEducatorData = async () => {
      try {
        const response = await getCurrentEducator();
        const educator = response.data;
        
        setEducatorId(educator._id);
        setProfileData({
          firstName: educator.firstName || "",
          lastName: educator.lastName || "",
          email: educator.email || "",
          mobileNumber: educator.mobileNumber || "",
          bio: educator.bio || "",
          introVideoLink: educator.introVideoLink || "",
          specialization: educator.specialization || "Physics",
          yearsExperience: educator.yearsExperience || 0,
        });
        setWorkExperience(educator.workExperience || []);
        setQualifications(educator.qualification || []);
        setSocialLinks(educator.socials || {
          linkedin: "",
          twitter: "",
          facebook: "",
          instagram: "",
          youtube: "",
        });
      } catch (error) {
        console.error("Error fetching educator data:", error);
        toast({
          title: "Error",
          description: "Failed to load educator data",
          variant: "destructive",
        });
      }
    };

    fetchEducatorData();
  }, []);

  // Handle basic info update
  const handleUpdateBasicInfo = async () => {
    if (!educatorId) return;
    
    setLoading(true);
    try {
      const response = await updateEducatorBasicInfo(educatorId, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
        bio: profileData.bio,
        introVideoLink: profileData.introVideoLink,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    if (!educatorId) return;
    
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await updateEducatorImage(educatorId, file);
      
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
      
      // Refresh page or update image state
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle work experience update
  const handleUpdateWorkExperience = async () => {
    if (!educatorId) return;
    
    setLoading(true);
    try {
      await updateEducatorWorkExperience(educatorId, workExperience);
      
      toast({
        title: "Success",
        description: "Work experience updated successfully",
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update work experience",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle qualifications update
  const handleUpdateQualifications = async () => {
    if (!educatorId) return;
    
    setLoading(true);
    try {
      await updateEducatorQualifications(educatorId, qualifications);
      
      toast({
        title: "Success",
        description: "Qualifications updated successfully",
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update qualifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle social links update
  const handleUpdateSocialLinks = async () => {
    if (!educatorId) return;
    
    setLoading(true);
    try {
      await updateEducatorSocialLinks(educatorId, socialLinks);
      
      toast({
        title: "Success",
        description: "Social links updated successfully",
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update social links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle specialization update
  const handleUpdateSpecialization = async () => {
    if (!educatorId) return;
    
    setLoading(true);
    try {
      await updateEducatorSpecializationAndExperience(educatorId, {
        specialization: profileData.specialization,
        yearsExperience: profileData.yearsExperience,
      });
      
      toast({
        title: "Success",
        description: "Specialization updated successfully",
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update specialization",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Your existing UI with buttons that call these handlers */}
      <Button onClick={handleUpdateBasicInfo} disabled={loading}>
        Save Profile
      </Button>
    </div>
  );
}
```

## Error Handling

All methods return promises and may throw errors. Always wrap calls in try-catch blocks:

```javascript
try {
  const response = await updateEducatorBasicInfo(educatorId, data);
  // Success handling
} catch (error) {
  // Error handling
  console.error(error.response?.data?.message || error.message);
}
```

## Response Format

Successful responses typically follow this structure:
```javascript
{
  success: true,
  message: "Updated successfully",
  data: {
    // Updated educator object
  }
}
```

## Validation Rules

Refer to `educatorUpdate.routes.js` for specific validation:
- **Name fields**: 5-30 characters
- **Bio**: 10-500 characters
- **URLs**: Must be valid URL format
- **Email**: Must be valid email format
- **Mobile**: 10 digits
- **Dates**: Must be valid date format
- **Specialization**: Must be one of the allowed values
