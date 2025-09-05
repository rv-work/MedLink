class TranslationService {
  constructor() {
    this.apiUrl = 'https://libretranslate.de/translate';
    this.fallbackUrl = 'https://translate.googleapis.com/translate_a/single';
  }

  async translate(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) return text;
    
    try {
      // Try LibreTranslate first
      return await this.libreTranslate(text, sourceLang, targetLang);
    } catch (error) {
      console.error('LibreTranslate failed:', error);
      try {
        // Fallback to Google Translate
        return await this.googleTranslate(text, sourceLang, targetLang);
      } catch (fallbackError) {
        console.error('Google Translate fallback failed:', fallbackError);
        return text; // Return original text if all fails
      }
    }
  }

  async libreTranslate(text, sourceLang, targetLang) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const result = await response.json();
    return result.translatedText;
  }

  async googleTranslate(text, sourceLang, targetLang) {
    const url = `${this.fallbackUrl}?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result[0][0][0];
  }

  getSupportedLanguages() {
    return {
      // Major Indian Languages (22 Scheduled Languages)
      'hi': 'हिंदी (Hindi)',
      'bn': 'বাংলা (Bengali)',
      'mr': 'मराठी (Marathi)',
      'te': 'తెలుగు (Telugu)',
      'ta': 'தமிழ் (Tamil)',
      'gu': 'ગુજરાતી (Gujarati)',
      'ur': 'اردو (Urdu)',
      'kn': 'ಕನ್ನಡ (Kannada)',
      'or': 'ଓଡ଼ିଆ (Odia)',
      'ml': 'മലയാളം (Malayalam)',
      'pa': 'ਪੰਜਾਬੀ (Punjabi)',
      'as': 'অসমীয়া (Assamese)',
      'ks': 'كٲشُر (Kashmiri)',
      'sd': 'سنڌي (Sindhi)',
      'ne': 'नेपाली (Nepali)',
      'sa': 'संस्कृतम् (Sanskrit)',
      'kok': 'कोंकणी (Konkani)',
      'mni': 'ꯃꯤꯇꯩ ꯂꯣꯟ (Manipuri)',
      'doi': 'डोगरी (Dogri)',
      'mai': 'मैथिली (Maithili)',
      'sat': 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)',
      'brx': 'बड़ो (Bodo)',
      
      // Regional Indian Languages
      'bho': 'भोजपुरी (Bhojpuri)',
      'mag': 'मगही (Magahi)',
      'awa': 'अवधी (Awadhi)',
      'raj': 'राजस्थानी (Rajasthani)',
      'bpy': 'বিষ্ণুপ্রিয়া (Bishnupriya)',
      'hne': 'छत्तीसगढ़ी (Chhattisgarhi)',
      'gom': 'गोवा कोंकणी (Goan Konkani)',
      'tcy': 'ತುಳು (Tulu)',
      'new': 'नेपाल भाषा (Newari)',
      
      // International Languages
      'en': 'English',
      'ar': 'العربية (Arabic)',
      'zh': '中文 (Chinese)',
      'ja': '日本語 (Japanese)',
      'ko': '한국어 (Korean)',
      'fr': 'Français (French)',
      'de': 'Deutsch (German)',
      'es': 'Español (Spanish)',
      'pt': 'Português (Portuguese)',
      'ru': 'Русский (Russian)',
      'it': 'Italiano (Italian)'
    };
  }

  getLanguageFamilies() {
    return {
      'Indo-Aryan (North Indian)': [
        'hi', 'bn', 'mr', 'gu', 'ur', 'or', 'pa', 'as', 'ks', 'sd', 'ne', 'sa', 'kok', 'doi', 'mai', 'bho', 'mag', 'awa', 'raj', 'hne'
      ],
      'Dravidian (South Indian)': [
        'te', 'ta', 'kn', 'ml', 'tcy'
      ],
      'Sino-Tibetan': [
        'mni', 'brx', 'new'
      ],
      'Austro-Asiatic': [
        'sat'
      ],
      'International': [
        'en', 'ar', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'it'
      ]
    };
  }

  getStateLanguages() {
    return {
      'Andhra Pradesh': ['te', 'ur', 'en'],
      'Arunachal Pradesh': ['en', 'hi'],
      'Assam': ['as', 'bn', 'brx', 'en'],
      'Bihar': ['hi', 'ur', 'mai', 'bho', 'mag'],
      'Chhattisgarhi': ['hi', 'hne'],
      'Goa': ['kok', 'gom', 'mr', 'en'],
      'Gujarat': ['gu', 'hi', 'en'],
      'Haryana': ['hi', 'pa', 'ur', 'en'],
      'Himachal Pradesh': ['hi', 'sa', 'en'],
      'Jharkhand': ['hi', 'ur', 'bn', 'or', 'sat'],
      'Karnataka': ['kn', 'ur', 'te', 'ta', 'ml', 'mr', 'tcy', 'en'],
      'Kerala': ['ml', 'en', 'ta'],
      'Madhya Pradesh': ['hi', 'ur', 'en'],
      'Maharashtra': ['mr', 'hi', 'ur', 'gu', 'kn', 'te', 'en'],
      'Manipur': ['mni', 'en'],
      'Meghalaya': ['en', 'hi', 'bn'],
      'Mizoram': ['en', 'hi', 'bn'],
      'Nagaland': ['en'],
      'Odisha': ['or', 'hi', 'ur', 'te', 'en'],
      'Punjab': ['pa', 'hi', 'ur', 'en'],
      'Rajasthan': ['hi', 'raj', 'ur', 'sd', 'pa', 'en'],
      'Sikkim': ['en', 'ne', 'hi', 'gu'],
      'Tamil Nadu': ['ta', 'en', 'te', 'ml', 'kn', 'ur'],
      'Telangana': ['te', 'ur', 'hi', 'en'],
      'Tripura': ['bn', 'en', 'hi'],
      'Uttar Pradesh': ['hi', 'ur', 'awa', 'bho', 'en'],
      'Uttarakhand': ['hi', 'sa', 'ur', 'pa', 'ne', 'en'],
      'West Bengal': ['bn', 'en', 'ne', 'ur', 'hi', 'or', 'sat'],
      'Delhi': ['hi', 'en', 'ur', 'pa', 'bn'],
      'Mumbai': ['mr', 'hi', 'gu', 'ur', 'te', 'ta', 'kn', 'ml', 'en'],
      'Bangalore': ['kn', 'te', 'ta', 'ml', 'hi', 'ur', 'en'],
      'Chennai': ['ta', 'te', 'ml', 'kn', 'hi', 'ur', 'en'],
      'Hyderabad': ['te', 'ur', 'hi', 'mr', 'kn', 'ta', 'en'],
      'Kolkata': ['bn', 'hi', 'ur', 'or', 'ne', 'en'],
      'Pune': ['mr', 'hi', 'en', 'gu', 'kn', 'te']
    };
  }

  getPopularLanguages() {
    return ['hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or'];
  }

  getQuickSwitchLanguages() {
    return ['hi', 'bn', 'ta', 'te', 'en'];
  }

  // Get appropriate speech synthesis voice
  getBestVoice(language) {
    const voices = speechSynthesis.getVoices();
    
    // Language-specific voice mapping
    const voiceMap = {
      'hi': ['hi-IN', 'hi'],
      'bn': ['bn-IN', 'bn-BD', 'bn'],
      'ta': ['ta-IN', 'ta-LK', 'ta'],
      'te': ['te-IN', 'te'],
      'ml': ['ml-IN', 'ml'],
      'kn': ['kn-IN', 'kn'],
      'gu': ['gu-IN', 'gu'],
      'mr': ['mr-IN', 'mr'],
      'pa': ['pa-IN', 'pa'],
      'or': ['or-IN', 'or'],
      'as': ['as-IN', 'as'],
      'ur': ['ur-IN', 'ur-PK', 'ur'],
      'ne': ['ne-NP', 'ne'],
      'en': ['en-IN', 'en-US', 'en-GB', 'en']
    };

    const preferredVoices = voiceMap[language] || [language];
    
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.lang.startsWith(preferred));
      if (voice) return voice;
    }
    
    // Fallback to any English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }
}

export default new TranslationService();
