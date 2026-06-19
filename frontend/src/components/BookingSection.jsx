import { useState, useEffect, useRef } from "react";
import { Calendar, User, ChevronUp, ChevronDown } from "lucide-react";
import "./BookingSection.css";

const BookingSection = ({ onReserveClick, onHeroReserveClick, autoOpenCheckIn }) => {
  const [guests, setGuests] = useState("1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // February 2026
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const dropdownRef = useRef(null);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  
  const guestOptions = [
    "1",
    "2", 
    "3",
    "4"
  ];
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const handleGuestSelect = (option) => {
    setGuests(option);
    setShowDropdown(false);
  };
  
  const handleDateSelect = (date, isCheckIn) => {
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (isCheckIn) {
      setCheckInDate(formattedDate);
      setShowCheckInCalendar(false);
    } else {
      setCheckOutDate(formattedDate);
      setShowCheckOutCalendar(false);
    }
  };
  
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };
  
  const selectYear = (year) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearSelector(false);
  };
  
  const selectMonth = (monthIndex) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setShowMonthSelector(false);
  };
  
  const clearSelection = (isCheckIn) => {
    if (isCheckIn) {
      setCheckInDate("");
    } else {
      setCheckOutDate("");
    }
  };
  
  // Generate calendar days - only show future dates
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Previous month days (only show if they're in the future)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      prevDate.setHours(0, 0, 0, 0);
      
      // Only show previous month days if they're in the future
      if (prevDate >= today) {
        days.push({
          date: prevDate,
          isCurrentMonth: false,
          isSelectable: true
        });
      } else {
        // Show as disabled/non-selectable
        days.push({
          date: prevDate,
          isCurrentMonth: false,
          isSelectable: false
        });
      }
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      currentDate.setHours(0, 0, 0, 0);
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isSelectable: currentDate >= today
      });
    }
    
    // Next month days (only show if they're in the future)
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      nextDate.setHours(0, 0, 0, 0);
      
      // Only show next month days if they're in the future
      if (nextDate >= today) {
        days.push({
          date: nextDate,
          isCurrentMonth: false,
          isSelectable: true
        });
      } else {
        // This shouldn't happen since we're going forward, but just in case
        days.push({
          date: nextDate,
          isCurrentMonth: false,
          isSelectable: false
        });
      }
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // State to track if we're on mobile
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Check if mobile device and update state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Auto-open check-in calendar when triggered
  useEffect(() => {
    if (autoOpenCheckIn && isMobileDevice) {
      setShowCheckInCalendar(true);
    }
  }, [autoOpenCheckIn, isMobileDevice]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (checkInRef.current && !checkInRef.current.contains(event.target)) {
        setShowCheckInCalendar(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(event.target)) {
        setShowCheckOutCalendar(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reusable calendar component
  const CalendarPopup = ({ isOpen, setIsOpen, isCheckIn, isModal }) => {
    const calendarRef = useRef(null);
    const selectedDate = isCheckIn ? checkInDate : checkOutDate;
    const dateValue = selectedDate ? new Date(selectedDate.split('-').reverse().join('-')) : null;

    return (
      <div className={`calendar-popup ${isModal ? 'calendar-modal' : ''}`} ref={calendarRef}>
        <div className="calendar-header">
          <div className="calendar-navigation">
            <button 
              className="nav-button" 
              onClick={(e) => {
                e.stopPropagation();
                navigateMonth(-1);
              }}
            >
              <ChevronUp size={16} />
            </button>
            <div className="month-year-selector">
              {!showMonthSelector && !showYearSelector && (
                <>
                  <button 
                    className="selector-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMonthSelector(!showMonthSelector);
                      setShowYearSelector(false);
                    }}
                  >
                    {months[currentMonth.getMonth()]}
                  </button>
                  <button 
                    className="selector-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowYearSelector(!showYearSelector);
                      setShowMonthSelector(false);
                    }}
                  >
                    {currentMonth.getFullYear()}
                  </button>
                </>
              )}
            </div>
            <button 
              className="nav-button" 
              onClick={(e) => {
                e.stopPropagation();
                navigateMonth(1);
              }}
            >
              <ChevronDown size={16} />
            </button>
          </div>
          
          {/* Month Selector Dropdown */}
          {showMonthSelector && (
            <div className="selector-dropdown months-dropdown">
              {months.map((month, index) => (
                <button
                  key={month}
                  className={`selector-option ${index === currentMonth.getMonth() ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectMonth(index);
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
          )}
          
          {/* Year Selector Dropdown */}
          {showYearSelector && (
            <div className="selector-dropdown years-dropdown">
              {Array.from({length: 20}, (_, i) => {
                const currentYear = new Date().getFullYear();
                const year = currentYear + i;
                return (
                  <button
                    key={year}
                    className={`selector-option ${year === currentMonth.getFullYear() ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectYear(year);
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="calendar-grid">
          <div className="weekdays">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {calendarDays.map((dayObj, index) => {
              const isSelected = dateValue && dateValue.toDateString() === dayObj.date.toDateString();
              
              return (
                <div 
                  key={index}
                  className={`calendar-day 
                    ${isSelected ? 'selected' : ''} 
                    ${!dayObj.isCurrentMonth ? 'other-month' : ''}
                    ${!dayObj.isSelectable ? 'disabled' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dayObj.isSelectable) {
                      handleDateSelect(dayObj.date, isCheckIn);
                    }
                  }}
                >
                  {dayObj.date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="calendar-footer">
          <button 
            className="footer-button"
            onClick={(e) => {
              e.stopPropagation();
              clearSelection(isCheckIn);
            }}
          >
            Clear
          </button>
          <button 
            className="footer-button"
            onClick={(e) => {
              e.stopPropagation();
              const today = new Date();
              handleDateSelect(today, isCheckIn);
            }}
          >
            Today
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <section className="booking-section">
      <div className="booking-container">
        <div className="booking-field">
          <label className="field-label">CHECK-IN</label>
          <div 
            ref={checkInRef}
            className="input-wrapper"
            onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
          >
            <Calendar className="field-icon" />
            <input 
              type="text" 
              placeholder="dd-mm-yyyy" 
              className="date-input"
              value={checkInDate}
              readOnly
            />
            
            {showCheckInCalendar && (
              <CalendarPopup isCheckIn={true} isModal={isMobileDevice} />
            )}
          </div>
        </div>
        
        <div className="booking-field">
          <label className="field-label">CHECK-OUT</label>
          <div 
            ref={checkOutRef}
            className="input-wrapper"
            onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
          >
            <Calendar className="field-icon" />
            <input 
              type="text" 
              placeholder="dd-mm-yyyy" 
              className="date-input"
              value={checkOutDate}
              readOnly
            />
            
            {showCheckOutCalendar && (
              <CalendarPopup isCheckIn={false} isModal={isMobileDevice} />
            )}
          </div>
        </div>
        
        <div className="booking-field">
          <label className="field-label">GUESTS</label>
          <div 
            ref={dropdownRef}
            className="guests-wrapper"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <User className="field-icon" />
            <span className="guests-text">{guests}</span>
            <svg 
              className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`} 
              width="12" 
              height="12" 
              viewBox="0 0 12 12"
              fill="none"
            >
              <path 
                d="M3 4.5L6 7.5L9 4.5" 
                stroke="#999999" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            
            {showDropdown && (
              <div className="guests-dropdown">
                {guestOptions.map((option, index) => (
                  <div 
                    key={index}
                    className="dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGuestSelect(option);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button 
          className="availability-button"
          onClick={onReserveClick}
        >
          CHECK AVAILABILITY
        </button>
      </div>
    </section>
  );
};

export default BookingSection;