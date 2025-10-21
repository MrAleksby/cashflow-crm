import React, { useMemo } from 'react';
import { Calendar, momentLocalizer, type Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { ClassSession } from '../types';

moment.locale('ru');
const localizer = momentLocalizer(moment);

interface ClassCalendarProps {
  classes: ClassSession[];
  onSelectSlot?: (start: Date) => void;
  onSelectEvent?: (classSession: ClassSession) => void;
}

interface CalendarEvent extends Event {
  resource: ClassSession;
}

const ClassCalendar: React.FC<ClassCalendarProps> = ({
  classes,
  onSelectSlot,
  onSelectEvent
}) => {
  const events: CalendarEvent[] = useMemo(() => {
    return classes.map(classSession => {
      const [hours, minutes] = classSession.time.split(':');
      const startDate = new Date(classSession.date);
      startDate.setHours(parseInt(hours), parseInt(minutes), 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // 1 час занятие по умолчанию
      
      return {
        title: `${classSession.time} - Занятие (${classSession.registeredChildren.length} детей)`,
        start: startDate,
        end: endDate,
        resource: classSession,
        allDay: false
      };
    });
  }, [classes]);

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(start);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const classSession = event.resource;
    const attendedCount = classSession.registeredChildren.filter(c => c.attended).length;
    const totalCount = classSession.registeredChildren.length;
    
    let backgroundColor = '#3174ad'; // default blue
    
    if (totalCount === 0) {
      backgroundColor = '#9ca3af'; // серый - нет записей
    } else if (attendedCount === totalCount) {
      backgroundColor = '#10b981'; // зеленый - все посетили
    } else if (attendedCount > 0) {
      backgroundColor = '#f59e0b'; // оранжевый - частично
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const messages = {
    today: 'Сегодня',
    previous: 'Назад',
    next: 'Вперед',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    agenda: 'Список',
    date: 'Дата',
    time: 'Время',
    event: 'Занятие',
    noEventsInRange: 'Нет занятий в этом периоде',
    showMore: (total: number) => `+${total} еще`
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        defaultView="month"
        views={['month', 'week', 'day']}
        style={{ height: '100%' }}
      />
      
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
          <span>Нет записей</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span>Есть записи</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
          <span>Частично посетили</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>Все посетили</span>
        </div>
      </div>
    </div>
  );
};

export default ClassCalendar;

