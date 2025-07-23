const mongoose = require('mongoose');
const Destination = require('../src/models/Destination');
require('dotenv').config();

// Comprehensive list of countries with ISO codes and Arabic names
const countriesData = [
  // Africa
  { country: { en: "Algeria", ar: "الجزائر" }, countryCode: "DZ", continent: "Africa", cities: [{ name: { en: "Algiers", ar: "الجزائر" } }, { name: { en: "Oran", ar: "وهران" } }] },
  { country: { en: "Angola", ar: "أنغولا" }, countryCode: "AO", continent: "Africa", cities: [{ name: { en: "Luanda", ar: "لواندا" } }] },
  { country: { en: "Benin", ar: "بنين" }, countryCode: "BJ", continent: "Africa", cities: [{ name: { en: "Porto-Novo", ar: "بورتو نوفو" } }] },
  { country: { en: "Botswana", ar: "بوتسوانا" }, countryCode: "BW", continent: "Africa", cities: [{ name: { en: "Gaborone", ar: "جابورون" } }] },
  { country: { en: "Burkina Faso", ar: "بوركينا فاسو" }, countryCode: "BF", continent: "Africa", cities: [{ name: { en: "Ouagadougou", ar: "واغادوغو" } }] },
  { country: { en: "Burundi", ar: "بوروندي" }, countryCode: "BI", continent: "Africa", cities: [{ name: { en: "Bujumbura", ar: "بوجومبورا" } }] },
  { country: { en: "Cameroon", ar: "الكاميرون" }, countryCode: "CM", continent: "Africa", cities: [{ name: { en: "Yaoundé", ar: "ياوندي" } }, { name: { en: "Douala", ar: "دوالا" } }] },
  { country: { en: "Cape Verde", ar: "الرأس الأخضر" }, countryCode: "CV", continent: "Africa", cities: [{ name: { en: "Praia", ar: "برايا" } }] },
  { country: { en: "Central African Republic", ar: "جمهورية أفريقيا الوسطى" }, countryCode: "CF", continent: "Africa", cities: [{ name: { en: "Bangui", ar: "بانغي" } }] },
  { country: { en: "Chad", ar: "تشاد" }, countryCode: "TD", continent: "Africa", cities: [{ name: { en: "N'Djamena", ar: "انجامينا" } }] },
  { country: { en: "Comoros", ar: "جزر القمر" }, countryCode: "KM", continent: "Africa", cities: [{ name: { en: "Moroni", ar: "موروني" } }] },
  { country: { en: "Democratic Republic of the Congo", ar: "جمهورية الكونغو الديمقراطية" }, countryCode: "CD", continent: "Africa", cities: [{ name: { en: "Kinshasa", ar: "كينشاسا" } }] },
  { country: { en: "Republic of the Congo", ar: "جمهورية الكونغو" }, countryCode: "CG", continent: "Africa", cities: [{ name: { en: "Brazzaville", ar: "برازافيل" } }] },
  { country: { en: "Djibouti", ar: "جيبوتي" }, countryCode: "DJ", continent: "Africa", cities: [{ name: { en: "Djibouti City", ar: "مدينة جيبوتي" } }] },
  { country: { en: "Egypt", ar: "مصر" }, countryCode: "EG", continent: "Africa", cities: [{ name: { en: "Cairo", ar: "القاهرة" } }, { name: { en: "Alexandria", ar: "الإسكندرية" } }, { name: { en: "Luxor", ar: "الأقصر" } }, { name: { en: "Aswan", ar: "أسوان" } }, { name: { en: "Sharm El Sheikh", ar: "شرم الشيخ" } }, { name: { en: "Hurghada", ar: "الغردقة" } }] },
  { country: { en: "Equatorial Guinea", ar: "غينيا الاستوائية" }, countryCode: "GQ", continent: "Africa", cities: [{ name: { en: "Malabo", ar: "مالابو" } }] },
  { country: { en: "Eritrea", ar: "إريتريا" }, countryCode: "ER", continent: "Africa", cities: [{ name: { en: "Asmara", ar: "أسمرة" } }] },
  { country: { en: "Eswatini", ar: "إسواتيني" }, countryCode: "SZ", continent: "Africa", cities: [{ name: { en: "Mbabane", ar: "مبابان" } }] },
  { country: { en: "Ethiopia", ar: "إثيوبيا" }, countryCode: "ET", continent: "Africa", cities: [{ name: { en: "Addis Ababa", ar: "أديس أبابا" } }] },
  { country: { en: "Gabon", ar: "الغابون" }, countryCode: "GA", continent: "Africa", cities: [{ name: { en: "Libreville", ar: "ليبرفيل" } }] },
  { country: { en: "Gambia", ar: "غامبيا" }, countryCode: "GM", continent: "Africa", cities: [{ name: { en: "Banjul", ar: "بانجول" } }] },
  { country: { en: "Ghana", ar: "غانا" }, countryCode: "GH", continent: "Africa", cities: [{ name: { en: "Accra", ar: "أكرا" } }] },
  { country: { en: "Guinea", ar: "غينيا" }, countryCode: "GN", continent: "Africa", cities: [{ name: { en: "Conakry", ar: "كوناكري" } }] },
  { country: { en: "Guinea-Bissau", ar: "غينيا بيساو" }, countryCode: "GW", continent: "Africa", cities: [{ name: { en: "Bissau", ar: "بيساو" } }] },
  { country: { en: "Ivory Coast", ar: "ساحل العاج" }, countryCode: "CI", continent: "Africa", cities: [{ name: { en: "Yamoussoukro", ar: "ياموسوكرو" } }, { name: { en: "Abidjan", ar: "أبيدجان" } }] },
  { country: { en: "Kenya", ar: "كينيا" }, countryCode: "KE", continent: "Africa", cities: [{ name: { en: "Nairobi", ar: "نيروبي" } }, { name: { en: "Mombasa", ar: "مومباسا" } }] },
  { country: { en: "Lesotho", ar: "ليسوتو" }, countryCode: "LS", continent: "Africa", cities: [{ name: { en: "Maseru", ar: "ماسيرو" } }] },
  { country: { en: "Liberia", ar: "ليبيريا" }, countryCode: "LR", continent: "Africa", cities: [{ name: { en: "Monrovia", ar: "مونروفيا" } }] },
  { country: { en: "Libya", ar: "ليبيا" }, countryCode: "LY", continent: "Africa", cities: [{ name: { en: "Tripoli", ar: "طرابلس" } }, { name: { en: "Benghazi", ar: "بنغازي" } }] },
  { country: { en: "Madagascar", ar: "مدغشقر" }, countryCode: "MG", continent: "Africa", cities: [{ name: { en: "Antananarivo", ar: "أنتاناناريفو" } }] },
  { country: { en: "Malawi", ar: "مالاوي" }, countryCode: "MW", continent: "Africa", cities: [{ name: { en: "Lilongwe", ar: "ليلونغوي" } }] },
  { country: { en: "Mali", ar: "مالي" }, countryCode: "ML", continent: "Africa", cities: [{ name: { en: "Bamako", ar: "باماكو" } }] },
  { country: { en: "Mauritania", ar: "موريتانيا" }, countryCode: "MR", continent: "Africa", cities: [{ name: { en: "Nouakchott", ar: "نواكشوط" } }] },
  { country: { en: "Mauritius", ar: "موريشيوس" }, countryCode: "MU", continent: "Africa", cities: [{ name: { en: "Port Louis", ar: "بورت لويس" } }] },
  { country: { en: "Morocco", ar: "المغرب" }, countryCode: "MA", continent: "Africa", cities: [{ name: { en: "Rabat", ar: "الرباط" } }, { name: { en: "Casablanca", ar: "الدار البيضاء" } }, { name: { en: "Marrakech", ar: "مراكش" } }, { name: { en: "Fez", ar: "فاس" } }, { name: { en: "Tangier", ar: "طنجة" } }, { name: { en: "Agadir", ar: "أكادير" } }] },
  { country: { en: "Mozambique", ar: "موزمبيق" }, countryCode: "MZ", continent: "Africa", cities: [{ name: { en: "Maputo", ar: "مابوتو" } }] },
  { country: { en: "Namibia", ar: "ناميبيا" }, countryCode: "NA", continent: "Africa", cities: [{ name: { en: "Windhoek", ar: "ويندهوك" } }] },
  { country: { en: "Niger", ar: "النيجر" }, countryCode: "NE", continent: "Africa", cities: [{ name: { en: "Niamey", ar: "نيامي" } }] },
  { country: { en: "Nigeria", ar: "نيجيريا" }, countryCode: "NG", continent: "Africa", cities: [{ name: { en: "Abuja", ar: "أبوجا" } }, { name: { en: "Lagos", ar: "لاغوس" } }] },
  { country: { en: "Rwanda", ar: "رواندا" }, countryCode: "RW", continent: "Africa", cities: [{ name: { en: "Kigali", ar: "كيغالي" } }] },
  { country: { en: "São Tomé and Príncipe", ar: "ساو تومي وبرينسيبي" }, countryCode: "ST", continent: "Africa", cities: [{ name: { en: "São Tomé", ar: "ساو تومي" } }] },
  { country: { en: "Senegal", ar: "السنغال" }, countryCode: "SN", continent: "Africa", cities: [{ name: { en: "Dakar", ar: "داكار" } }] },
  { country: { en: "Seychelles", ar: "سيشل" }, countryCode: "SC", continent: "Africa", cities: [{ name: { en: "Victoria", ar: "فيكتوريا" } }] },
  { country: { en: "Sierra Leone", ar: "سيراليون" }, countryCode: "SL", continent: "Africa", cities: [{ name: { en: "Freetown", ar: "فريتاون" } }] },
  { country: { en: "Somalia", ar: "الصومال" }, countryCode: "SO", continent: "Africa", cities: [{ name: { en: "Mogadishu", ar: "مقديشو" } }] },
  { country: { en: "South Africa", ar: "جنوب أفريقيا" }, countryCode: "ZA", continent: "Africa", cities: [{ name: { en: "Cape Town", ar: "كيب تاون" } }, { name: { en: "Johannesburg", ar: "جوهانسبرغ" } }, { name: { en: "Durban", ar: "ديربان" } }, { name: { en: "Pretoria", ar: "بريتوريا" } }] },
  { country: { en: "South Sudan", ar: "جنوب السودان" }, countryCode: "SS", continent: "Africa", cities: [{ name: { en: "Juba", ar: "جوبا" } }] },
  { country: { en: "Sudan", ar: "السودان" }, countryCode: "SD", continent: "Africa", cities: [{ name: { en: "Khartoum", ar: "الخرطوم" } }] },
  { country: { en: "Tanzania", ar: "تنزانيا" }, countryCode: "TZ", continent: "Africa", cities: [{ name: { en: "Dodoma", ar: "دودوما" } }, { name: { en: "Dar es Salaam", ar: "دار السلام" } }, { name: { en: "Zanzibar", ar: "زنجبار" } }] },
  { country: { en: "Togo", ar: "توغو" }, countryCode: "TG", continent: "Africa", cities: [{ name: { en: "Lomé", ar: "لومي" } }] },
  { country: { en: "Tunisia", ar: "تونس" }, countryCode: "TN", continent: "Africa", cities: [{ name: { en: "Tunis", ar: "تونس" } }, { name: { en: "Sousse", ar: "سوسة" } }, { name: { en: "Sfax", ar: "صفاقس" } }] },
  { country: { en: "Uganda", ar: "أوغندا" }, countryCode: "UG", continent: "Africa", cities: [{ name: { en: "Kampala", ar: "كامبالا" } }] },
  { country: { en: "Zambia", ar: "زامبيا" }, countryCode: "ZM", continent: "Africa", cities: [{ name: { en: "Lusaka", ar: "لوساكا" } }] },
  { country: { en: "Zimbabwe", ar: "زيمبابوي" }, countryCode: "ZW", continent: "Africa", cities: [{ name: { en: "Harare", ar: "هراري" } }] },

  // Asia
  { country: { en: "Afghanistan", ar: "أفغانستان" }, countryCode: "AF", continent: "Asia", cities: [{ name: { en: "Kabul", ar: "كابول" } }] },
  { country: { en: "Armenia", ar: "أرمينيا" }, countryCode: "AM", continent: "Asia", cities: [{ name: { en: "Yerevan", ar: "يريفان" } }] },
  { country: { en: "Azerbaijan", ar: "أذربيجان" }, countryCode: "AZ", continent: "Asia", cities: [{ name: { en: "Baku", ar: "باكو" } }] },
  { country: { en: "Bahrain", ar: "البحرين" }, countryCode: "BH", continent: "Asia", cities: [{ name: { en: "Manama", ar: "المنامة" } }] },
  { country: { en: "Bangladesh", ar: "بنغلاديش" }, countryCode: "BD", continent: "Asia", cities: [{ name: { en: "Dhaka", ar: "دكا" } }, { name: { en: "Chittagong", ar: "شيتاغونغ" } }] },
  { country: { en: "Bhutan", ar: "بوتان" }, countryCode: "BT", continent: "Asia", cities: [{ name: { en: "Thimphu", ar: "تيمفو" } }] },
  { country: { en: "Brunei", ar: "بروناي" }, countryCode: "BN", continent: "Asia", cities: [{ name: { en: "Bandar Seri Begawan", ar: "بندر سري بكاوان" } }] },
  { country: { en: "Cambodia", ar: "كمبوديا" }, countryCode: "KH", continent: "Asia", cities: [{ name: { en: "Phnom Penh", ar: "بنوم بنه" } }, { name: { en: "Siem Reap", ar: "سييم ريب" } }] },
  { country: { en: "China", ar: "الصين" }, countryCode: "CN", continent: "Asia", cities: [{ name: { en: "Beijing", ar: "بكين" } }, { name: { en: "Shanghai", ar: "شنغهاي" } }, { name: { en: "Guangzhou", ar: "قوانغژو" } }, { name: { en: "Shenzhen", ar: "شنتشن" } }, { name: { en: "Chengdu", ar: "تشنغدو" } }, { name: { en: "Hangzhou", ar: "هانغژو" } }, { name: { en: "Xi'an", ar: "شيان" } }, { name: { en: "Suzhou", ar: "سوژو" } }] },
  { country: { en: "Cyprus", ar: "قبرص" }, countryCode: "CY", continent: "Asia", cities: [{ name: { en: "Nicosia", ar: "نيقوسيا" } }, { name: { en: "Limassol", ar: "ليماسول" } }] },
  { country: { en: "Georgia", ar: "جورجيا" }, countryCode: "GE", continent: "Asia", cities: [{ name: { en: "Tbilisi", ar: "تبليسي" } }, { name: { en: "Batumi", ar: "باتومي" } }] },
  { country: { en: "India", ar: "الهند" }, countryCode: "IN", continent: "Asia", cities: [{ name: { en: "New Delhi", ar: "نيودلهي" } }, { name: { en: "Mumbai", ar: "مومباي" } }, { name: { en: "Bangalore", ar: "بنغالور" } }, { name: { en: "Hyderabad", ar: "حيدراباد" } }, { name: { en: "Chennai", ar: "تشيناي" } }, { name: { en: "Kolkata", ar: "كولكاتا" } }, { name: { en: "Pune", ar: "بونا" } }, { name: { en: "Jaipur", ar: "جايبور" } }, { name: { en: "Goa", ar: "غوا" } }, { name: { en: "Agra", ar: "أغرة" } }] },
  { country: { en: "Indonesia", ar: "إندونيسيا" }, countryCode: "ID", continent: "Asia", cities: [{ name: { en: "Jakarta", ar: "جاكرتا" } }, { name: { en: "Surabaya", ar: "سورابايا" } }, { name: { en: "Bandung", ar: "باندونغ" } }, { name: { en: "Medan", ar: "ميدان" } }, { name: { en: "Bali", ar: "بالي" } }, { name: { en: "Yogyakarta", ar: "يوجياكارتا" } }] },
  { country: { en: "Iran", ar: "إيران" }, countryCode: "IR", continent: "Asia", cities: [{ name: { en: "Tehran", ar: "طهران" } }, { name: { en: "Isfahan", ar: "أصفهان" } }, { name: { en: "Shiraz", ar: "شيراز" } }] },
  { country: { en: "Iraq", ar: "العراق" }, countryCode: "IQ", continent: "Asia", cities: [{ name: { en: "Baghdad", ar: "بغداد" } }, { name: { en: "Erbil", ar: "أربيل" } }, { name: { en: "Basra", ar: "البصرة" } }, { name: { en: "Mosul", ar: "الموصل" } }, { name: { en: "Najaf", ar: "النجف" } }, { name: { en: "Karbala", ar: "كربلاء" } }] },
  { country: { en: "Israel", ar: "إسرائيل" }, countryCode: "IL", continent: "Asia", cities: [{ name: { en: "Jerusalem", ar: "القدس" } }, { name: { en: "Tel Aviv", ar: "تل أبيب" } }, { name: { en: "Haifa", ar: "حيفا" } }] },
  { country: { en: "Japan", ar: "اليابان" }, countryCode: "JP", continent: "Asia", cities: [{ name: { en: "Tokyo", ar: "طوكيو" } }, { name: { en: "Osaka", ar: "أوساكا" } }, { name: { en: "Kyoto", ar: "كيوتو" } }, { name: { en: "Yokohama", ar: "يوكوهاما" } }, { name: { en: "Nagoya", ar: "ناغويا" } }, { name: { en: "Sapporo", ar: "سابورو" } }, { name: { en: "Fukuoka", ar: "فوكوكا" } }, { name: { en: "Hiroshima", ar: "هيروشيما" } }] },
  { country: { en: "Jordan", ar: "الأردن" }, countryCode: "JO", continent: "Asia", cities: [{ name: { en: "Amman", ar: "عمان" } }, { name: { en: "Petra", ar: "البتراء" } }, { name: { en: "Aqaba", ar: "العقبة" } }, { name: { en: "Jerash", ar: "جرش" } }] },
  { country: { en: "Kazakhstan", ar: "كازاخستان" }, countryCode: "KZ", continent: "Asia", cities: [{ name: { en: "Nur-Sultan", ar: "نور سلطان" } }, { name: { en: "Almaty", ar: "ألماتي" } }] },
  { country: { en: "Kuwait", ar: "الكويت" }, countryCode: "KW", continent: "Asia", cities: [{ name: { en: "Kuwait City", ar: "مدينة الكويت" } }] },
  { country: { en: "Kyrgyzstan", ar: "قيرغيزستان" }, countryCode: "KG", continent: "Asia", cities: [{ name: { en: "Bishkek", ar: "بيشكيك" } }] },
  { country: { en: "Laos", ar: "لاوس" }, countryCode: "LA", continent: "Asia", cities: [{ name: { en: "Vientiane", ar: "فيينتيان" } }] },
  { country: { en: "Lebanon", ar: "لبنان" }, countryCode: "LB", continent: "Asia", cities: [{ name: { en: "Beirut", ar: "بيروت" } }, { name: { en: "Tripoli", ar: "طرابلس" } }] },
  { country: { en: "Malaysia", ar: "ماليزيا" }, countryCode: "MY", continent: "Asia", cities: [{ name: { en: "Kuala Lumpur", ar: "كوالالمبور" } }, { name: { en: "Penang", ar: "بينانغ" } }, { name: { en: "Johor Bahru", ar: "جوهور بهرو" } }, { name: { en: "Malacca", ar: "ملقا" } }] },
  { country: { en: "Maldives", ar: "المالديف" }, countryCode: "MV", continent: "Asia", cities: [{ name: { en: "Malé", ar: "ماليه" } }] },
  { country: { en: "Mongolia", ar: "منغوليا" }, countryCode: "MN", continent: "Asia", cities: [{ name: { en: "Ulaanbaatar", ar: "أولان باتور" } }] },
  { country: { en: "Myanmar", ar: "ميانمار" }, countryCode: "MM", continent: "Asia", cities: [{ name: { en: "Naypyidaw", ar: "نايبيداو" } }, { name: { en: "Yangon", ar: "يانغون" } }] },
  { country: { en: "Nepal", ar: "نيبال" }, countryCode: "NP", continent: "Asia", cities: [{ name: { en: "Kathmandu", ar: "كاتماندو" } }] },
  { country: { en: "North Korea", ar: "كوريا الشمالية" }, countryCode: "KP", continent: "Asia", cities: [{ name: { en: "Pyongyang", ar: "بيونغ يانغ" } }] },
  { country: { en: "Oman", ar: "عُمان" }, countryCode: "OM", continent: "Asia", cities: [{ name: { en: "Muscat", ar: "مسقط" } }, { name: { en: "Salalah", ar: "صلالة" } }, { name: { en: "Nizwa", ar: "نزوى" } }] },
  { country: { en: "Pakistan", ar: "باكستان" }, countryCode: "PK", continent: "Asia", cities: [{ name: { en: "Islamabad", ar: "إسلام آباد" } }, { name: { en: "Karachi", ar: "كراتشي" } }, { name: { en: "Lahore", ar: "لاهور" } }] },
  { country: { en: "Palestine", ar: "فلسطين" }, countryCode: "PS", continent: "Asia", cities: [{ name: { en: "Ramallah", ar: "رام الله" } }, { name: { en: "Gaza", ar: "غزة" } }, { name: { en: "Bethlehem", ar: "بيت لحم" } }] },
  { country: { en: "Philippines", ar: "الفلبين" }, countryCode: "PH", continent: "Asia", cities: [{ name: { en: "Manila", ar: "مانيلا" } }, { name: { en: "Cebu", ar: "سيبو" } }, { name: { en: "Davao", ar: "دافاو" } }, { name: { en: "Boracay", ar: "بوراكاي" } }] },
  { country: { en: "Qatar", ar: "قطر" }, countryCode: "QA", continent: "Asia", cities: [{ name: { en: "Doha", ar: "الدوحة" } }] },
  { country: { en: "Russia", ar: "روسيا" }, countryCode: "RU", continent: "Asia", cities: [{ name: { en: "Moscow", ar: "موسكو" } }, { name: { en: "Saint Petersburg", ar: "سانت بطرسبرغ" } }, { name: { en: "Novosibirsk", ar: "نوفوسيبيرسك" } }, { name: { en: "Yekaterinburg", ar: "يكاترينبورغ" } }] },
  { country: { en: "Saudi Arabia", ar: "المملكة العربية السعودية" }, countryCode: "SA", continent: "Asia", cities: [{ name: { en: "Riyadh", ar: "الرياض" } }, { name: { en: "Jeddah", ar: "جدة" } }, { name: { en: "Mecca", ar: "مكة المكرمة" } }, { name: { en: "Medina", ar: "المدينة المنورة" } }, { name: { en: "Dammam", ar: "الدمام" } }, { name: { en: "Taif", ar: "الطائف" } }, { name: { en: "Abha", ar: "أبها" } }, { name: { en: "Al-Ahsa", ar: "الأحساء" } }, { name: { en: "Tabuk", ar: "تبوك" } }, { name: { en: "Buraidah", ar: "بريدة" } }, { name: { en: "Khamis Mushait", ar: "خميس مشيط" } }, { name: { en: "Hail", ar: "حائل" } }, { name: { en: "Hofuf", ar: "الهفوف" } }, { name: { en: "Jubail", ar: "الجبيل" } }, { name: { en: "Dhahran", ar: "الظهران" } }, { name: { en: "Yanbu", ar: "ينبع" } }, { name: { en: "Al Khobar", ar: "الخبر" } }, { name: { en: "Najran", ar: "نجران" } }, { name: { en: "Al-Qatif", ar: "القطيف" } }, { name: { en: "Sakaka", ar: "سكاكا" } }] },
  { country: { en: "Singapore", ar: "سنغافورة" }, countryCode: "SG", continent: "Asia", cities: [{ name: { en: "Singapore", ar: "سنغافورة" } }] },
  { country: { en: "South Korea", ar: "كوريا الجنوبية" }, countryCode: "KR", continent: "Asia", cities: [{ name: { en: "Seoul", ar: "سيول" } }, { name: { en: "Busan", ar: "بوسان" } }, { name: { en: "Incheon", ar: "إنتشون" } }, { name: { en: "Jeju", ar: "جيجو" } }] },
  { country: { en: "Sri Lanka", ar: "سريلانكا" }, countryCode: "LK", continent: "Asia", cities: [{ name: { en: "Colombo", ar: "كولومبو" } }, { name: { en: "Kandy", ar: "كاندي" } }] },
  { country: { en: "Syria", ar: "سوريا" }, countryCode: "SY", continent: "Asia", cities: [{ name: { en: "Damascus", ar: "دمشق" } }, { name: { en: "Aleppo", ar: "حلب" } }] },
  { country: { en: "Taiwan", ar: "تايوان" }, countryCode: "TW", continent: "Asia", cities: [{ name: { en: "Taipei", ar: "تايبيه" } }, { name: { en: "Kaohsiung", ar: "كاوشيونغ" } }] },
  { country: { en: "Tajikistan", ar: "طاجيكستان" }, countryCode: "TJ", continent: "Asia", cities: [{ name: { en: "Dushanbe", ar: "دوشانبي" } }] },
  { country: { en: "Thailand", ar: "تايلاند" }, countryCode: "TH", continent: "Asia", cities: [{ name: { en: "Bangkok", ar: "بانكوك" } }, { name: { en: "Chiang Mai", ar: "تشيانغ ماي" } }, { name: { en: "Phuket", ar: "فوكيت" } }, { name: { en: "Pattaya", ar: "باتايا" } }, { name: { en: "Krabi", ar: "كرابي" } }] },
  { country: { en: "Turkey", ar: "تركيا" }, countryCode: "TR", continent: "Asia", cities: [{ name: { en: "Ankara", ar: "أنقرة" } }, { name: { en: "Istanbul", ar: "إسطنبول" } }, { name: { en: "Izmir", ar: "إزمير" } }, { name: { en: "Antalya", ar: "أنطاليا" } }, { name: { en: "Bursa", ar: "بورصة" } }, { name: { en: "Adana", ar: "أضنة" } }, { name: { en: "Cappadocia", ar: "كابادوكيا" } }, { name: { en: "Bodrum", ar: "بودروم" } }] },
  { country: { en: "Turkmenistan", ar: "تركمانستان" }, countryCode: "TM", continent: "Asia", cities: [{ name: { en: "Ashgabat", ar: "عشق آباد" } }] },
  { country: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" }, countryCode: "AE", continent: "Asia", cities: [{ name: { en: "Dubai", ar: "دبي" } }, { name: { en: "Abu Dhabi", ar: "أبو ظبي" } }, { name: { en: "Sharjah", ar: "الشارقة" } }, { name: { en: "Ajman", ar: "عجمان" } }, { name: { en: "Ras Al Khaimah", ar: "رأس الخيمة" } }, { name: { en: "Fujairah", ar: "الفجيرة" } }, { name: { en: "Umm Al Quwain", ar: "أم القيوين" } }] },
  { country: { en: "Uzbekistan", ar: "أوزبكستان" }, countryCode: "UZ", continent: "Asia", cities: [{ name: { en: "Tashkent", ar: "طشقند" } }, { name: { en: "Samarkand", ar: "سمرقند" } }, { name: { en: "Bukhara", ar: "بخارى" } }] },
  { country: { en: "Vietnam", ar: "فيتنام" }, countryCode: "VN", continent: "Asia", cities: [{ name: { en: "Hanoi", ar: "هانوي" } }, { name: { en: "Ho Chi Minh City", ar: "مدينة هو تشي مينه" } }, { name: { en: "Da Nang", ar: "دا نانغ" } }, { name: { en: "Hoi An", ar: "هوي آن" } }] },
  { country: { en: "Yemen", ar: "اليمن" }, countryCode: "YE", continent: "Asia", cities: [{ name: { en: "Sanaa", ar: "صنعاء" } }, { name: { en: "Aden", ar: "عدن" } }] },

  // Europe
  { country: { en: "Albania", ar: "ألبانيا" }, countryCode: "AL", continent: "Europe", cities: [{ name: { en: "Tirana", ar: "تيرانا" } }] },
  { country: { en: "Andorra", ar: "أندورا" }, countryCode: "AD", continent: "Europe", cities: [{ name: { en: "Andorra la Vella", ar: "أندورا لا فيلا" } }] },
  { country: { en: "Austria", ar: "النمسا" }, countryCode: "AT", continent: "Europe", cities: [{ name: { en: "Vienna", ar: "فيينا" } }, { name: { en: "Salzburg", ar: "سالزبورغ" } }, { name: { en: "Innsbruck", ar: "إنسبروك" } }] },
  { country: { en: "Belarus", ar: "بيلاروسيا" }, countryCode: "BY", continent: "Europe", cities: [{ name: { en: "Minsk", ar: "مينسك" } }] },
  { country: { en: "Belgium", ar: "بلجيكا" }, countryCode: "BE", continent: "Europe", cities: [{ name: { en: "Brussels", ar: "بروكسل" } }, { name: { en: "Antwerp", ar: "أنتويرب" } }, { name: { en: "Bruges", ar: "بروج" } }] },
  { country: { en: "Bosnia and Herzegovina", ar: "البوسنة والهرسك" }, countryCode: "BA", continent: "Europe", cities: [{ name: { en: "Sarajevo", ar: "سراييفو" } }] },
  { country: { en: "Bulgaria", ar: "بلغاريا" }, countryCode: "BG", continent: "Europe", cities: [{ name: { en: "Sofia", ar: "صوفيا" } }, { name: { en: "Plovdiv", ar: "بلوفديف" } }] },
  { country: { en: "Croatia", ar: "كرواتيا" }, countryCode: "HR", continent: "Europe", cities: [{ name: { en: "Zagreb", ar: "زغرب" } }, { name: { en: "Dubrovnik", ar: "دوبروفنيك" } }, { name: { en: "Split", ar: "سبليت" } }] },
  { country: { en: "Czech Republic", ar: "جمهورية التشيك" }, countryCode: "CZ", continent: "Europe", cities: [{ name: { en: "Prague", ar: "براغ" } }, { name: { en: "Brno", ar: "برنو" } }] },
  { country: { en: "Denmark", ar: "الدنمارك" }, countryCode: "DK", continent: "Europe", cities: [{ name: { en: "Copenhagen", ar: "كوبنهاغن" } }] },
  { country: { en: "Estonia", ar: "إستونيا" }, countryCode: "EE", continent: "Europe", cities: [{ name: { en: "Tallinn", ar: "تالين" } }] },
  { country: { en: "Finland", ar: "فنلندا" }, countryCode: "FI", continent: "Europe", cities: [{ name: { en: "Helsinki", ar: "هلسنكي" } }] },
  { country: { en: "France", ar: "فرنسا" }, countryCode: "FR", continent: "Europe", cities: [{ name: { en: "Paris", ar: "باريس" } }, { name: { en: "Lyon", ar: "ليون" } }, { name: { en: "Marseille", ar: "مرسيليا" } }, { name: { en: "Nice", ar: "نيس" } }, { name: { en: "Cannes", ar: "كان" } }, { name: { en: "Bordeaux", ar: "بوردو" } }, { name: { en: "Toulouse", ar: "تولوز" } }, { name: { en: "Strasbourg", ar: "ستراسبورغ" } }] },
  { country: { en: "Germany", ar: "ألمانيا" }, countryCode: "DE", continent: "Europe", cities: [{ name: { en: "Berlin", ar: "برلين" } }, { name: { en: "Munich", ar: "ميونخ" } }, { name: { en: "Hamburg", ar: "هامبورغ" } }, { name: { en: "Cologne", ar: "كولونيا" } }, { name: { en: "Frankfurt", ar: "فرانكفورت" } }, { name: { en: "Dresden", ar: "درسدن" } }, { name: { en: "Düsseldorf", ar: "دوسلدورف" } }] },
  { country: { en: "Greece", ar: "اليونان" }, countryCode: "GR", continent: "Europe", cities: [{ name: { en: "Athens", ar: "أثينا" } }, { name: { en: "Thessaloniki", ar: "تسالونيكي" } }, { name: { en: "Santorini", ar: "سانتوريني" } }, { name: { en: "Mykonos", ar: "ميكونوس" } }, { name: { en: "Rhodes", ar: "رودس" } }] },
  { country: { en: "Hungary", ar: "المجر" }, countryCode: "HU", continent: "Europe", cities: [{ name: { en: "Budapest", ar: "بودابست" } }] },
  { country: { en: "Iceland", ar: "أيسلندا" }, countryCode: "IS", continent: "Europe", cities: [{ name: { en: "Reykjavik", ar: "ريكيافيك" } }] },
  { country: { en: "Ireland", ar: "أيرلندا" }, countryCode: "IE", continent: "Europe", cities: [{ name: { en: "Dublin", ar: "دبلن" } }, { name: { en: "Cork", ar: "كورك" } }] },
  { country: { en: "Italy", ar: "إيطاليا" }, countryCode: "IT", continent: "Europe", cities: [{ name: { en: "Rome", ar: "روما" } }, { name: { en: "Milan", ar: "ميلان" } }, { name: { en: "Venice", ar: "البندقية" } }, { name: { en: "Florence", ar: "فلورنسا" } }, { name: { en: "Naples", ar: "نابولي" } }, { name: { en: "Turin", ar: "تورين" } }, { name: { en: "Bologna", ar: "بولونيا" } }, { name: { en: "Pisa", ar: "بيزا" } }] },
  { country: { en: "Latvia", ar: "لاتفيا" }, countryCode: "LV", continent: "Europe", cities: [{ name: { en: "Riga", ar: "ريغا" } }] },
  { country: { en: "Liechtenstein", ar: "ليختنشتاين" }, countryCode: "LI", continent: "Europe", cities: [{ name: { en: "Vaduz", ar: "فادوز" } }] },
  { country: { en: "Lithuania", ar: "ليتوانيا" }, countryCode: "LT", continent: "Europe", cities: [{ name: { en: "Vilnius", ar: "فيلنيوس" } }] },
  { country: { en: "Luxembourg", ar: "لوكسمبورغ" }, countryCode: "LU", continent: "Europe", cities: [{ name: { en: "Luxembourg City", ar: "مدينة لوكسمبورغ" } }] },
  { country: { en: "Malta", ar: "مالطا" }, countryCode: "MT", continent: "Europe", cities: [{ name: { en: "Valletta", ar: "فاليتا" } }] },
  { country: { en: "Moldova", ar: "مولدوفا" }, countryCode: "MD", continent: "Europe", cities: [{ name: { en: "Chisinau", ar: "كيشيناو" } }] },
  { country: { en: "Monaco", ar: "موناكو" }, countryCode: "MC", continent: "Europe", cities: [{ name: { en: "Monaco", ar: "موناكو" } }] },
  { country: { en: "Montenegro", ar: "الجبل الأسود" }, countryCode: "ME", continent: "Europe", cities: [{ name: { en: "Podgorica", ar: "بودغوريتسا" } }] },
  { country: { en: "Netherlands", ar: "هولندا" }, countryCode: "NL", continent: "Europe", cities: [{ name: { en: "Amsterdam", ar: "أمستردام" } }, { name: { en: "The Hague", ar: "لاهاي" } }, { name: { en: "Rotterdam", ar: "روتردام" } }, { name: { en: "Utrecht", ar: "أوتريخت" } }] },
  { country: { en: "North Macedonia", ar: "شمال مقدونيا" }, countryCode: "MK", continent: "Europe", cities: [{ name: { en: "Skopje", ar: "سكوبيه" } }] },
  { country: { en: "Norway", ar: "النرويج" }, countryCode: "NO", continent: "Europe", cities: [{ name: { en: "Oslo", ar: "أوسلو" } }, { name: { en: "Bergen", ar: "بيرغن" } }] },
  { country: { en: "Poland", ar: "بولندا" }, countryCode: "PL", continent: "Europe", cities: [{ name: { en: "Warsaw", ar: "وارسو" } }, { name: { en: "Krakow", ar: "كراكوف" } }, { name: { en: "Gdansk", ar: "غدانسك" } }] },
  { country: { en: "Portugal", ar: "البرتغال" }, countryCode: "PT", continent: "Europe", cities: [{ name: { en: "Lisbon", ar: "لشبونة" } }, { name: { en: "Porto", ar: "بورتو" } }, { name: { en: "Faro", ar: "فارو" } }] },
  { country: { en: "Romania", ar: "رومانيا" }, countryCode: "RO", continent: "Europe", cities: [{ name: { en: "Bucharest", ar: "بوخارست" } }, { name: { en: "Cluj-Napoca", ar: "كلوج نابوكا" } }] },
  { country: { en: "San Marino", ar: "سان مارينو" }, countryCode: "SM", continent: "Europe", cities: [{ name: { en: "San Marino", ar: "سان مارينو" } }] },
  { country: { en: "Serbia", ar: "صربيا" }, countryCode: "RS", continent: "Europe", cities: [{ name: { en: "Belgrade", ar: "بلغراد" } }] },
  { country: { en: "Slovakia", ar: "سلوفاكيا" }, countryCode: "SK", continent: "Europe", cities: [{ name: { en: "Bratislava", ar: "براتيسلافا" } }] },
  { country: { en: "Slovenia", ar: "سلوفينيا" }, countryCode: "SI", continent: "Europe", cities: [{ name: { en: "Ljubljana", ar: "ليوبليانا" } }] },
  { country: { en: "Spain", ar: "إسبانيا" }, countryCode: "ES", continent: "Europe", cities: [{ name: { en: "Madrid", ar: "مدريد" } }, { name: { en: "Barcelona", ar: "برشلونة" } }, { name: { en: "Seville", ar: "إشبيلية" } }, { name: { en: "Valencia", ar: "بلنسية" } }, { name: { en: "Granada", ar: "غرناطة" } }, { name: { en: "Bilbao", ar: "بلباو" } }, { name: { en: "Palma", ar: "بالما" } }, { name: { en: "Toledo", ar: "طليطلة" } }] },
  { country: { en: "Sweden", ar: "السويد" }, countryCode: "SE", continent: "Europe", cities: [{ name: { en: "Stockholm", ar: "ستوكهولم" } }, { name: { en: "Gothenburg", ar: "غوتنبرغ" } }] },
  { country: { en: "Switzerland", ar: "سويسرا" }, countryCode: "CH", continent: "Europe", cities: [{ name: { en: "Bern", ar: "برن" } }, { name: { en: "Zurich", ar: "زيورخ" } }, { name: { en: "Geneva", ar: "جنيف" } }, { name: { en: "Basel", ar: "بازل" } }, { name: { en: "Interlaken", ar: "إنترلاكن" } }] },
  { country: { en: "Ukraine", ar: "أوكرانيا" }, countryCode: "UA", continent: "Europe", cities: [{ name: { en: "Kiev", ar: "كييف" } }, { name: { en: "Odesa", ar: "أوديسا" } }] },
  { country: { en: "United Kingdom", ar: "المملكة المتحدة" }, countryCode: "GB", continent: "Europe", cities: [{ name: { en: "London", ar: "لندن" } }, { name: { en: "Edinburgh", ar: "إدنبرة" } }, { name: { en: "Manchester", ar: "مانشستر" } }, { name: { en: "Liverpool", ar: "ليفربول" } }, { name: { en: "Birmingham", ar: "برمنغهام" } }, { name: { en: "Glasgow", ar: "غلاسكو" } }, { name: { en: "Oxford", ar: "أكسفورد" } }, { name: { en: "Cambridge", ar: "كامبريدج" } }] },
  { country: { en: "Vatican City", ar: "مدينة الفاتيكان" }, countryCode: "VA", continent: "Europe", cities: [{ name: { en: "Vatican City", ar: "مدينة الفاتيكان" } }] },

  // North America
  { country: { en: "Antigua and Barbuda", ar: "أنتيغوا وباربودا" }, countryCode: "AG", continent: "North America", cities: [{ name: { en: "Saint John's", ar: "سانت جونز" } }] },
  { country: { en: "Bahamas", ar: "جزر البهاما" }, countryCode: "BS", continent: "North America", cities: [{ name: { en: "Nassau", ar: "ناساو" } }] },
  { country: { en: "Barbados", ar: "بربادوس" }, countryCode: "BB", continent: "North America", cities: [{ name: { en: "Bridgetown", ar: "بريدجتاون" } }] },
  { country: { en: "Belize", ar: "بليز" }, countryCode: "BZ", continent: "North America", cities: [{ name: { en: "Belmopan", ar: "بلموبان" } }] },
  { country: { en: "Canada", ar: "كندا" }, countryCode: "CA", continent: "North America", cities: [{ name: { en: "Ottawa", ar: "أوتاوا" } }, { name: { en: "Toronto", ar: "تورونتو" } }, { name: { en: "Vancouver", ar: "فانكوفر" } }, { name: { en: "Montreal", ar: "مونتريال" } }, { name: { en: "Calgary", ar: "كالغاري" } }, { name: { en: "Quebec City", ar: "مدينة كيبيك" } }] },
  { country: { en: "Costa Rica", ar: "كوستا ريكا" }, countryCode: "CR", continent: "North America", cities: [{ name: { en: "San José", ar: "سان خوسيه" } }] },
  { country: { en: "Cuba", ar: "كوبا" }, countryCode: "CU", continent: "North America", cities: [{ name: { en: "Havana", ar: "هافانا" } }] },
  { country: { en: "Dominica", ar: "دومينيكا" }, countryCode: "DM", continent: "North America", cities: [{ name: { en: "Roseau", ar: "روزو" } }] },
  { country: { en: "Dominican Republic", ar: "جمهورية الدومينيكان" }, countryCode: "DO", continent: "North America", cities: [{ name: { en: "Santo Domingo", ar: "سانتو دومينغو" } }] },
  { country: { en: "El Salvador", ar: "السلفادور" }, countryCode: "SV", continent: "North America", cities: [{ name: { en: "San Salvador", ar: "سان سلفادور" } }] },
  { country: { en: "Grenada", ar: "غرينادا" }, countryCode: "GD", continent: "North America", cities: [{ name: { en: "Saint George's", ar: "سانت جورج" } }] },
  { country: { en: "Guatemala", ar: "غواتيمالا" }, countryCode: "GT", continent: "North America", cities: [{ name: { en: "Guatemala City", ar: "مدينة غواتيمالا" } }] },
  { country: { en: "Haiti", ar: "هايتي" }, countryCode: "HT", continent: "North America", cities: [{ name: { en: "Port-au-Prince", ar: "بورت أو برنس" } }] },
  { country: { en: "Honduras", ar: "هندوراس" }, countryCode: "HN", continent: "North America", cities: [{ name: { en: "Tegucigalpa", ar: "تيغوسيغالبا" } }] },
  { country: { en: "Jamaica", ar: "جامايكا" }, countryCode: "JM", continent: "North America", cities: [{ name: { en: "Kingston", ar: "كينغستون" } }] },
  { country: { en: "Mexico", ar: "المكسيك" }, countryCode: "MX", continent: "North America", cities: [{ name: { en: "Mexico City", ar: "مكسيكو سيتي" } }, { name: { en: "Cancun", ar: "كانكون" } }, { name: { en: "Puerto Vallarta", ar: "بويرتو فايارتا" } }, { name: { en: "Guadalajara", ar: "غوادالاخارا" } }, { name: { en: "Playa del Carmen", ar: "بلايا ديل كارمن" } }] },
  { country: { en: "Nicaragua", ar: "نيكاراغوا" }, countryCode: "NI", continent: "North America", cities: [{ name: { en: "Managua", ar: "ماناغوا" } }] },
  { country: { en: "Panama", ar: "بنما" }, countryCode: "PA", continent: "North America", cities: [{ name: { en: "Panama City", ar: "مدينة بنما" } }] },
  { country: { en: "Saint Kitts and Nevis", ar: "سانت كيتس ونيفيس" }, countryCode: "KN", continent: "North America", cities: [{ name: { en: "Basseterre", ar: "باستير" } }] },
  { country: { en: "Saint Lucia", ar: "سانت لوسيا" }, countryCode: "LC", continent: "North America", cities: [{ name: { en: "Castries", ar: "كاستريس" } }] },
  { country: { en: "Saint Vincent and the Grenadines", ar: "سانت فنسنت والغرينادين" }, countryCode: "VC", continent: "North America", cities: [{ name: { en: "Kingstown", ar: "كينغستاون" } }] },
  { country: { en: "Trinidad and Tobago", ar: "ترينيداد وتوباغو" }, countryCode: "TT", continent: "North America", cities: [{ name: { en: "Port of Spain", ar: "بورت أوف سبين" } }] },
  { country: { en: "United States", ar: "الولايات المتحدة" }, countryCode: "US", continent: "North America", cities: [{ name: { en: "Washington D.C.", ar: "واشنطن العاصمة" } }, { name: { en: "New York", ar: "نيويورك" } }, { name: { en: "Los Angeles", ar: "لوس أنجلوس" } }, { name: { en: "Chicago", ar: "شيكاغو" } }, { name: { en: "Houston", ar: "هيوستن" } }, { name: { en: "Philadelphia", ar: "فيلادلفيا" } }, { name: { en: "Phoenix", ar: "فينيكس" } }, { name: { en: "San Antonio", ar: "سان أنطونيو" } }, { name: { en: "San Diego", ar: "سان دييغو" } }, { name: { en: "Dallas", ar: "دالاس" } }, { name: { en: "San Jose", ar: "سان خوسيه" } }, { name: { en: "Austin", ar: "أوستن" } }, { name: { en: "Jacksonville", ar: "جاكسونفيل" } }, { name: { en: "Fort Worth", ar: "فورت وورث" } }, { name: { en: "Columbus", ar: "كولومبوس" } }, { name: { en: "San Francisco", ar: "سان فرانسيسكو" } }, { name: { en: "Charlotte", ar: "شارلوت" } }, { name: { en: "Indianapolis", ar: "إنديانابوليس" } }, { name: { en: "Seattle", ar: "سياتل" } }, { name: { en: "Denver", ar: "دنفر" } }, { name: { en: "Boston", ar: "بوسطن" } }, { name: { en: "El Paso", ar: "إل باسو" } }, { name: { en: "Detroit", ar: "ديترويت" } }, { name: { en: "Nashville", ar: "ناشفيل" } }, { name: { en: "Portland", ar: "بورتلاند" } }, { name: { en: "Memphis", ar: "ممفيس" } }, { name: { en: "Oklahoma City", ar: "مدينة أوكلاهوما" } }, { name: { en: "Las Vegas", ar: "لاس فيغاس" } }, { name: { en: "Louisville", ar: "لويفيل" } }, { name: { en: "Baltimore", ar: "بالتيمور" } }, { name: { en: "Milwaukee", ar: "ميلووكي" } }, { name: { en: "Albuquerque", ar: "ألبوكيرك" } }, { name: { en: "Tucson", ar: "توكسون" } }, { name: { en: "Fresno", ar: "فريسنو" } }, { name: { en: "Sacramento", ar: "ساكرامنتو" } }, { name: { en: "Mesa", ar: "ميسا" } }, { name: { en: "Kansas City", ar: "مدينة كانساس" } }, { name: { en: "Atlanta", ar: "أتلانتا" } }, { name: { en: "Long Beach", ar: "لونغ بيتش" } }, { name: { en: "Colorado Springs", ar: "كولورادو سبرينغز" } }, { name: { en: "Raleigh", ar: "رالي" } }, { name: { en: "Miami", ar: "ميامي" } }, { name: { en: "Virginia Beach", ar: "فيرجينيا بيتش" } }, { name: { en: "Omaha", ar: "أوماها" } }, { name: { en: "Oakland", ar: "أوكلاند" } }, { name: { en: "Minneapolis", ar: "مينيابوليس" } }, { name: { en: "Tulsa", ar: "تولسا" } }, { name: { en: "Arlington", ar: "أرلينغتون" } }, { name: { en: "New Orleans", ar: "نيو أورليانز" } }] },

  // South America
  { country: { en: "Argentina", ar: "الأرجنتين" }, countryCode: "AR", continent: "South America", cities: [{ name: { en: "Buenos Aires", ar: "بوينس آيرس" } }, { name: { en: "Córdoba", ar: "قرطبة" } }, { name: { en: "Rosario", ar: "روساريو" } }] },
  { country: { en: "Bolivia", ar: "بوليفيا" }, countryCode: "BO", continent: "South America", cities: [{ name: { en: "Sucre", ar: "سوكري" } }, { name: { en: "La Paz", ar: "لاباز" } }] },
  { country: { en: "Brazil", ar: "البرازيل" }, countryCode: "BR", continent: "South America", cities: [{ name: { en: "Brasília", ar: "برازيليا" } }, { name: { en: "São Paulo", ar: "ساو باولو" } }, { name: { en: "Rio de Janeiro", ar: "ريو دي جانيرو" } }, { name: { en: "Salvador", ar: "سلفادور" } }, { name: { en: "Fortaleza", ar: "فورتاليزا" } }] },
  { country: { en: "Chile", ar: "تشيلي" }, countryCode: "CL", continent: "South America", cities: [{ name: { en: "Santiago", ar: "سانتياغو" } }, { name: { en: "Valparaíso", ar: "فالبارايسو" } }] },
  { country: { en: "Colombia", ar: "كولومبيا" }, countryCode: "CO", continent: "South America", cities: [{ name: { en: "Bogotá", ar: "بوغوتا" } }, { name: { en: "Medellín", ar: "ميديلين" } }, { name: { en: "Cali", ar: "كالي" } }, { name: { en: "Cartagena", ar: "قرطاجنة" } }] },
  { country: { en: "Ecuador", ar: "الإكوادور" }, countryCode: "EC", continent: "South America", cities: [{ name: { en: "Quito", ar: "كيتو" } }, { name: { en: "Guayaquil", ar: "غواياكيل" } }] },
  { country: { en: "French Guiana", ar: "غويانا الفرنسية" }, countryCode: "GF", continent: "South America", cities: [{ name: { en: "Cayenne", ar: "كايين" } }] },
  { country: { en: "Guyana", ar: "غيانا" }, countryCode: "GY", continent: "South America", cities: [{ name: { en: "Georgetown", ar: "جورج تاون" } }] },
  { country: { en: "Paraguay", ar: "باراغواي" }, countryCode: "PY", continent: "South America", cities: [{ name: { en: "Asunción", ar: "أسونسيون" } }] },
  { country: { en: "Peru", ar: "بيرو" }, countryCode: "PE", continent: "South America", cities: [{ name: { en: "Lima", ar: "ليما" } }, { name: { en: "Cusco", ar: "كوسكو" } }, { name: { en: "Arequipa", ar: "أريكيبا" } }] },
  { country: { en: "Suriname", ar: "سورينام" }, countryCode: "SR", continent: "South America", cities: [{ name: { en: "Paramaribo", ar: "باراماريبو" } }] },
  { country: { en: "Uruguay", ar: "أوروغواي" }, countryCode: "UY", continent: "South America", cities: [{ name: { en: "Montevideo", ar: "مونتيفيديو" } }] },
  { country: { en: "Venezuela", ar: "فنزويلا" }, countryCode: "VE", continent: "South America", cities: [{ name: { en: "Caracas", ar: "كاراكاس" } }, { name: { en: "Maracaibo", ar: "ماراكايبو" } }] },

  // Australia
  { country: { en: "Australia", ar: "أستراليا" }, countryCode: "AU", continent: "Australia", cities: [{ name: { en: "Canberra", ar: "كانبيرا" } }, { name: { en: "Sydney", ar: "سيدني" } }, { name: { en: "Melbourne", ar: "ملبورن" } }, { name: { en: "Brisbane", ar: "بريسبان" } }, { name: { en: "Perth", ar: "بيرث" } }, { name: { en: "Adelaide", ar: "أديلايد" } }, { name: { en: "Gold Coast", ar: "الساحل الذهبي" } }, { name: { en: "Darwin", ar: "داروين" } }] },
  { country: { en: "Fiji", ar: "فيجي" }, countryCode: "FJ", continent: "Australia", cities: [{ name: { en: "Suva", ar: "سوفا" } }] },
  { country: { en: "Kiribati", ar: "كيريباتي" }, countryCode: "KI", continent: "Australia", cities: [{ name: { en: "Tarawa", ar: "تاراوا" } }] },
  { country: { en: "Marshall Islands", ar: "جزر مارشال" }, countryCode: "MH", continent: "Australia", cities: [{ name: { en: "Majuro", ar: "ماجورو" } }] },
  { country: { en: "Micronesia", ar: "ميكرونيزيا" }, countryCode: "FM", continent: "Australia", cities: [{ name: { en: "Palikir", ar: "باليكير" } }] },
  { country: { en: "Nauru", ar: "ناورو" }, countryCode: "NR", continent: "Australia", cities: [{ name: { en: "Yaren", ar: "يارين" } }] },
  { country: { en: "New Zealand", ar: "نيوزيلندا" }, countryCode: "NZ", continent: "Australia", cities: [{ name: { en: "Wellington", ar: "ويلينغتون" } }, { name: { en: "Auckland", ar: "أوكلاند" } }, { name: { en: "Christchurch", ar: "كرايستشيرش" } }, { name: { en: "Hamilton", ar: "هاميلتون" } }, { name: { en: "Queenstown", ar: "كوينزتاون" } }] },
  { country: { en: "Palau", ar: "بالاو" }, countryCode: "PW", continent: "Australia", cities: [{ name: { en: "Ngerulmud", ar: "نغيرولمود" } }] },
  { country: { en: "Papua New Guinea", ar: "بابوا غينيا الجديدة" }, countryCode: "PG", continent: "Australia", cities: [{ name: { en: "Port Moresby", ar: "بورت مورسبي" } }] },
  { country: { en: "Samoa", ar: "ساموا" }, countryCode: "WS", continent: "Australia", cities: [{ name: { en: "Apia", ar: "أبيا" } }] },
  { country: { en: "Solomon Islands", ar: "جزر سليمان" }, countryCode: "SB", continent: "Australia", cities: [{ name: { en: "Honiara", ar: "هونيارا" } }] },
  { country: { en: "Tonga", ar: "تونغا" }, countryCode: "TO", continent: "Australia", cities: [{ name: { en: "Nuku'alofa", ar: "نوكو ألوفا" } }] },
  { country: { en: "Tuvalu", ar: "توفالو" }, countryCode: "TV", continent: "Australia", cities: [{ name: { en: "Funafuti", ar: "فونافوتي" } }] },
  { country: { en: "Vanuatu", ar: "فانواتو" }, countryCode: "VU", continent: "Australia", cities: [{ name: { en: "Port Vila", ar: "بورت فيلا" } }] }
];

// Most visited cities to add to existing countries or as standalone
const additionalTopCities = [
  // Additional popular tourist cities not covered above
  { countryCode: "US", cities: [{ name: { en: "Orlando", ar: "أورلاندو" } }, { name: { en: "Honolulu", ar: "هونولولو" } }, { name: { en: "Key West", ar: "كي ويست" } }, { name: { en: "Napa Valley", ar: "وادي نابا" } }, { name: { en: "Yellowstone", ar: "يلوستون" } }, { name: { en: "Grand Canyon", ar: "غراند كانيون" } }] },
  { countryCode: "FR", cities: [{ name: { en: "Versailles", ar: "فرساي" } }, { name: { en: "Mont Blanc", ar: "مونت بلان" } }, { name: { en: "Normandy", ar: "نورماندي" } }, { name: { en: "Loire Valley", ar: "وادي لوار" } }] },
  { countryCode: "IT", cities: [{ name: { en: "Amalfi Coast", ar: "ساحل أمالفي" } }, { name: { en: "Cinque Terre", ar: "تشينكوي تيري" } }, { name: { en: "Portofino", ar: "بورتوفينو" } }, { name: { en: "Positano", ar: "بوزيتانو" } }] },
  { countryCode: "ES", cities: [{ name: { en: "Ibiza", ar: "إيبيزا" } }, { name: { en: "Mallorca", ar: "مايوركا" } }, { name: { en: "Canary Islands", ar: "جزر الكناري" } }, { name: { en: "Cordoba", ar: "قرطبة" } }] },
  { countryCode: "GB", cities: [{ name: { en: "Bath", ar: "باث" } }, { name: { en: "York", ar: "يورك" } }, { name: { en: "Canterbury", ar: "كانتربري" } }, { name: { en: "Stratford-upon-Avon", ar: "ستراتفورد أبون آفون" } }] },
  { countryCode: "DE", cities: [{ name: { en: "Neuschwanstein", ar: "نيوشفانشتاين" } }, { name: { en: "Heidelberg", ar: "هايدلبرغ" } }, { name: { en: "Rothenburg", ar: "روتنبورغ" } }] },
  { countryCode: "JP", cities: [{ name: { en: "Nara", ar: "نارا" } }, { name: { en: "Takayama", ar: "تاكاياما" } }, { name: { en: "Hakone", ar: "هاكوني" } }, { name: { en: "Mount Fuji", ar: "جبل فوجي" } }] },
  { countryCode: "CN", cities: [{ name: { en: "Guilin", ar: "غويلين" } }, { name: { en: "Lijiang", ar: "ليجيانغ" } }, { name: { en: "Zhangjiajie", ar: "تشانغجياجيه" } }] },
  { countryCode: "IN", cities: [{ name: { en: "Udaipur", ar: "أودايبور" } }, { name: { en: "Varanasi", ar: "فاراناسي" } }, { name: { en: "Kerala", ar: "كيرالا" } }, { name: { en: "Rishikesh", ar: "ريشيكيش" } }] },
  { countryCode: "TH", cities: [{ name: { en: "Ayutthaya", ar: "أيوتثايا" } }, { name: { en: "Koh Samui", ar: "كو ساموي" } }, { name: { en: "Phi Phi Islands", ar: "جزر في في" } }] },
  { countryCode: "VN", cities: [{ name: { en: "Halong Bay", ar: "خليج هالونغ" } }, { name: { en: "Sapa", ar: "سابا" } }, { name: { en: "Hue", ar: "هوي" } }] },
  { countryCode: "ID", cities: [{ name: { en: "Ubud", ar: "أوبود" } }, { name: { en: "Lombok", ar: "لومبوك" } }, { name: { en: "Borobudur", ar: "بوروبودور" } }] },
  { countryCode: "PH", cities: [{ name: { en: "Palawan", ar: "بالاوان" } }, { name: { en: "Bohol", ar: "بوهول" } }, { name: { en: "Siargao", ar: "سيارغاو" } }] },
  { countryCode: "MY", cities: [{ name: { en: "Langkawi", ar: "لانكاوي" } }, { name: { en: "Cameron Highlands", ar: "مرتفعات كاميرون" } }] },
  { countryCode: "EG", cities: [{ name: { en: "Dahab", ar: "دهب" } }, { name: { en: "Siwa Oasis", ar: "واحة سيوة" } }, { name: { en: "Abu Simbel", ar: "أبو سمبل" } }] },
  { countryCode: "MA", cities: [{ name: { en: "Chefchaouen", ar: "شفشاون" } }, { name: { en: "Essaouira", ar: "الصويرة" } }, { name: { en: "Ouarzazate", ar: "ورزازات" } }] },
  { countryCode: "ZA", cities: [{ name: { en: "Kruger National Park", ar: "حديقة كروغر الوطنية" } }, { name: { en: "Stellenbosch", ar: "ستيلينبوش" } }] },
  { countryCode: "KE", cities: [{ name: { en: "Masai Mara", ar: "ماساي مارا" } }, { name: { en: "Diani Beach", ar: "شاطئ ديانا" } }] },
  { countryCode: "TZ", cities: [{ name: { en: "Serengeti", ar: "سيرنغيتي" } }, { name: { en: "Kilimanjaro", ar: "كليمنجارو" } }, { name: { en: "Stone Town", ar: "ستون تاون" } }] },
  { countryCode: "JO", cities: [{ name: { en: "Wadi Rum", ar: "وادي رم" } }, { name: { en: "Dead Sea", ar: "البحر الميت" } }] },
  { countryCode: "IL", cities: [{ name: { en: "Eilat", ar: "إيلات" } }, { name: { en: "Nazareth", ar: "الناصرة" } }] },
  { countryCode: "LB", cities: [{ name: { en: "Baalbek", ar: "بعلبك" } }, { name: { en: "Byblos", ar: "جبيل" } }] },
  { countryCode: "GR", cities: [{ name: { en: "Crete", ar: "كريت" } }, { name: { en: "Delphi", ar: "دلفي" } }, { name: { en: "Meteora", ar: "ميتيورا" } }] },
  { countryCode: "HR", cities: [{ name: { en: "Hvar", ar: "هفار" } }, { name: { en: "Plitvice Lakes", ar: "بحيرات بليتفيتشي" } }] },
  { countryCode: "CZ", cities: [{ name: { en: "Cesky Krumlov", ar: "تشيسكي كروملوف" } }, { name: { en: "Karlovy Vary", ar: "كارلوفي فاري" } }] },
  { countryCode: "AT", cities: [{ name: { en: "Hallstatt", ar: "هالشتات" } }, { name: { en: "Melk", ar: "ميلك" } }] },
  { countryCode: "CH", cities: [{ name: { en: "Jungfraujoch", ar: "يونغفراويوخ" } }, { name: { en: "Matterhorn", ar: "ماترهورن" } }] },
  { countryCode: "NO", cities: [{ name: { en: "Tromsø", ar: "ترومسو" } }, { name: { en: "Geiranger", ar: "جيرانجر" } }, { name: { en: "Lofoten", ar: "لوفوتين" } }] },
  { countryCode: "IS", cities: [{ name: { en: "Blue Lagoon", ar: "البحيرة الزرقاء" } }, { name: { en: "Golden Circle", ar: "الدائرة الذهبية" } }] },
  { countryCode: "PT", cities: [{ name: { en: "Sintra", ar: "سينترا" } }, { name: { en: "Óbidos", ar: "أوبيدوس" } }, { name: { en: "Azores", ar: "الأزور" } }] },
  { countryCode: "PE", cities: [{ name: { en: "Machu Picchu", ar: "ماتشو بيتشو" } }, { name: { en: "Sacred Valley", ar: "الوادي المقدس" } }] },
  { countryCode: "BR", cities: [{ name: { en: "Iguazu Falls", ar: "شلالات إيغوازو" } }, { name: { en: "Fernando de Noronha", ar: "فيرناندو دي نورونها" } }] },
  { countryCode: "AR", cities: [{ name: { en: "Bariloche", ar: "باريلوتشي" } }, { name: { en: "Mendoza", ar: "مندوزا" } }, { name: { en: "Ushuaia", ar: "أوشوايا" } }] },
  { countryCode: "CL", cities: [{ name: { en: "Atacama Desert", ar: "صحراء أتاكاما" } }, { name: { en: "Easter Island", ar: "جزيرة الفصح" } }] },
  { countryCode: "MX", cities: [{ name: { en: "Tulum", ar: "تولوم" } }, { name: { en: "San Miguel de Allende", ar: "سان ميغيل دي آليندي" } }, { name: { en: "Oaxaca", ar: "واكساكا" } }] },
  { countryCode: "CA", cities: [{ name: { en: "Banff", ar: "بانف" } }, { name: { en: "Niagara Falls", ar: "شلالات نياجرا" } }, { name: { en: "Whistler", ar: "ويسلر" } }] },
  { countryCode: "AU", cities: [{ name: { en: "Cairns", ar: "كيرنز" } }, { name: { en: "Uluru", ar: "أولورو" } }, { name: { en: "Whitsunday Islands", ar: "جزر ويتصنداي" } }] },
  { countryCode: "NZ", cities: [{ name: { en: "Milford Sound", ar: "ميلفورد ساوند" } }, { name: { en: "Bay of Islands", ar: "خليج الجزر" } }, { name: { en: "Franz Josef Glacier", ar: "نهر فرانز جوزيف الجليدي" } }] },
  { countryCode: "FJ", cities: [{ name: { en: "Nadi", ar: "نادي" } }, { name: { en: "Coral Coast", ar: "الساحل المرجاني" } }] }
];

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function createUser() {
  // Check if a user exists for createdBy field
  const User = require('../src/models/User');
  let adminUser = await User.findOne({ role: 'admin' });
  
  if (!adminUser) {
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@trippat.com',
      password: 'tempPassword123',
      role: 'admin',
      isActive: true
    });
    console.log('Created admin user for destinations');
  }
  
  return adminUser._id;
}

async function populateDestinations() {
  try {
    await connectToDatabase();
    const adminUserId = await createUser();
    
    console.log('Starting destination population...');
    
    // Clear existing destinations
    await Destination.deleteMany({});
    console.log('Cleared existing destinations');
    
    let createdCount = 0;
    let updatedCount = 0;
    
    // Process main countries data
    for (const countryData of countriesData) {
      try {
        const destination = new Destination({
          ...countryData,
          createdBy: adminUserId
        });
        
        await destination.save();
        createdCount++;
        console.log(`Created: ${countryData.country.en} with ${countryData.cities.length} cities`);
      } catch (error) {
        console.error(`Error creating ${countryData.country.en}:`, error.message);
      }
    }
    
    // Add additional cities to existing countries
    for (const additionalData of additionalTopCities) {
      try {
        const existingDestination = await Destination.findOne({ 
          countryCode: additionalData.countryCode 
        });
        
        if (existingDestination) {
          // Add new cities to existing destination
          for (const city of additionalData.cities) {
            // Check if city already exists
            const cityExists = existingDestination.cities.some(
              existingCity => existingCity.name.en.toLowerCase() === city.name.en.toLowerCase()
            );
            
            if (!cityExists) {
              existingDestination.cities.push(city);
            }
          }
          
          await existingDestination.save();
          updatedCount++;
          console.log(`Updated ${existingDestination.country.en} with additional cities`);
        }
      } catch (error) {
        console.error(`Error updating country ${additionalData.countryCode}:`, error.message);
      }
    }
    
    // Get final statistics
    const totalDestinations = await Destination.countDocuments();
    const totalCities = await Destination.aggregate([
      { $unwind: '$cities' },
      { $count: 'totalCities' }
    ]);
    
    console.log('\n=== DESTINATION POPULATION COMPLETE ===');
    console.log(`✅ Created: ${createdCount} countries`);
    console.log(`✅ Updated: ${updatedCount} countries with additional cities`);
    console.log(`✅ Total Destinations: ${totalDestinations}`);
    console.log(`✅ Total Cities: ${totalCities[0]?.totalCities || 0}`);
    
    // Sample data verification
    console.log('\n=== SAMPLE DATA VERIFICATION ===');
    const sampleDestinations = await Destination.find({}).limit(3).select('country cities');
    sampleDestinations.forEach(dest => {
      console.log(`${dest.country.en} (${dest.country.ar}): ${dest.cities.length} cities`);
    });
    
    console.log('\n=== TOP DESTINATION COUNTRIES BY CITY COUNT ===');
    const topDestinations = await Destination.aggregate([
      {
        $project: {
          country: '$country.en',
          cityCount: { $size: '$cities' }
        }
      },
      { $sort: { cityCount: -1 } },
      { $limit: 10 }
    ]);
    
    topDestinations.forEach((dest, index) => {
      console.log(`${index + 1}. ${dest.country}: ${dest.cityCount} cities`);
    });
    
    console.log('\n✨ All destinations populated successfully!');
    
  } catch (error) {
    console.error('Population error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Execute the population
if (require.main === module) {
  populateDestinations();
}

module.exports = { populateDestinations, countriesData, additionalTopCities };