import { Between, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { BaseService } from '../services/BaseService';

export enum AnalysisPeriod {
  today = 'today',
  thisWeek = 'thisWeek',
  lastWeek = 'lastWeek',
  thisMonth = 'thisMonth',
  lastMonth = 'lastMonth',
  thisQuarter = 'thisQuarter',
  lastQuarter = 'lastQuarter',
  thisYear = 'thisYear',
  lastYear = 'lastYear',
  last30Days = 'last30Days',
  last365Days = 'last365Days',
  oldestDate = 'oldestDate',
}

export enum TrendsPeriod {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export const getAnalysisPeriods = (period?: AnalysisPeriod) => {
  const date = new Date();

  // Calculate the start of this week (Monday)
  const thisWeek = new Date(date);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based (0 = Monday, 6 = Sunday)
  thisWeek.setDate(date.getDate() - daysToMonday);
  thisWeek.setHours(0, 0, 0, 0);

  // Calculate the start of last week (Monday)
  const lastWeek = new Date(thisWeek);
  lastWeek.setDate(thisWeek.getDate() - 7);

  const thisMonth = new Date();
  thisMonth.setMonth(date.getMonth(), 1);
  thisMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date();
  lastMonth.setMonth(date.getMonth() - 1, 1);
  lastMonth.setHours(0, 0, 0, 0);

  function getQuarterStart(month: number) {
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const startOfQuarter = new Date(
      Date.UTC(date.getFullYear(), quarterStartMonth, 1)
    );
    startOfQuarter.setHours(0, 0, 0, 0);
    return startOfQuarter;
  }

  const thisQuarter = getQuarterStart(date.getMonth());

  const lastQuarter = new Date(thisQuarter);
  lastQuarter.setUTCMonth(thisQuarter.getUTCMonth() - 3);
  lastQuarter.setHours(0, 0, 0, 0);

  const thisYear = new Date();
  thisYear.setMonth(0, 1);
  thisYear.setHours(0, 0, 0, 0);

  const lastYear = new Date();
  lastYear.setFullYear(date.getFullYear() - 1, 0, 1);
  lastYear.setHours(0, 0, 0, 0);

  // Calculate the start of the last 30 days
  const last30Days = new Date(date);
  last30Days.setDate(date.getDate() - 30);
  last30Days.setHours(0, 0, 0, 0);

  // Calculate the start of the last 365 days
  const last365Days = new Date(date);
  last365Days.setDate(date.getDate() - 365);
  last365Days.setHours(0, 0, 0, 0);

  const oldestDate = new Date(0);

  const thisWeekEnd = new Date(thisWeek);
  thisWeekEnd.setDate(thisWeek.getDate() + 6); // Set to the end of the week (Sunday)
  thisWeekEnd.setHours(23, 59, 59, 999);

  const lastWeekEnd = new Date(lastWeek);
  lastWeekEnd.setDate(lastWeek.getDate() + 6); // Set to the end of the week (Sunday)
  lastWeekEnd.setHours(23, 59, 59, 999);

  const currentPeriod = {
    lastPeriod: lastWeek,
    startDate: thisWeek,
    endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1), // End of today
  };

  if (period) {
    switch (period) {
      case AnalysisPeriod.today: {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        const yesterday = new Date();
        yesterday.setDate(date.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        currentPeriod.startDate = startDate;
        currentPeriod.endDate = endDate;
        currentPeriod.lastPeriod = yesterday;
        break;
      }
      case AnalysisPeriod.thisWeek: {
        currentPeriod.startDate = thisWeek;
        currentPeriod.endDate = thisWeekEnd;
        currentPeriod.lastPeriod = lastWeek;
        break;
      }
      case AnalysisPeriod.lastWeek: {
        const lastPeriod = new Date(lastWeek);
        lastPeriod.setDate(lastWeek.getDate() - 7);
        currentPeriod.startDate = lastWeek;
        currentPeriod.endDate = lastWeekEnd;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.thisMonth: {
        const endOfMonth = new Date(date);
        endOfMonth.setMonth(date.getMonth() + 1, 0); // Last day of current month
        endOfMonth.setHours(23, 59, 59, 999);

        currentPeriod.startDate = thisMonth;
        currentPeriod.endDate = endOfMonth;
        currentPeriod.lastPeriod = lastMonth;
        break;
      }
      case AnalysisPeriod.lastMonth: {
        const lastPeriod = new Date(lastMonth);
        lastPeriod.setMonth(lastMonth.getMonth() - 1);
        lastPeriod.setHours(0, 0, 0, 0);

        const endOfLastMonth = new Date(lastMonth);
        endOfLastMonth.setDate(0); // Last day of previous month
        endOfLastMonth.setHours(23, 59, 59, 999);

        currentPeriod.startDate = lastMonth;
        currentPeriod.endDate = endOfLastMonth;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.thisQuarter: {
        const endOfQuarter = new Date(thisQuarter);
        endOfQuarter.setUTCMonth(thisQuarter.getUTCMonth() + 3, 0); // Last day of current quarter
        endOfQuarter.setHours(23, 59, 59, 999);

        currentPeriod.startDate = thisQuarter;
        currentPeriod.endDate = endOfQuarter;
        currentPeriod.lastPeriod = lastQuarter;
        break;
      }
      case AnalysisPeriod.lastQuarter: {
        const lastPeriod = new Date(lastQuarter);
        lastPeriod.setUTCMonth(lastQuarter.getUTCMonth() - 3);
        lastPeriod.setHours(0, 0, 0, 0);

        const endOfLastQuarter = new Date(thisQuarter);
        endOfLastQuarter.setUTCDate(0); // Last day of previous quarter
        endOfLastQuarter.setHours(23, 59, 59, 999);

        currentPeriod.startDate = lastQuarter;
        currentPeriod.endDate = endOfLastQuarter;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.thisYear: {
        const endOfYear = new Date(date.getFullYear(), 11, 31); // December 31st
        endOfYear.setHours(23, 59, 59, 999);

        currentPeriod.startDate = thisYear;
        currentPeriod.endDate = endOfYear;
        currentPeriod.lastPeriod = lastYear;
        break;
      }
      case AnalysisPeriod.lastYear: {
        const lastPeriod = new Date(lastYear);
        lastPeriod.setFullYear(lastYear.getFullYear() - 1);
        lastPeriod.setHours(0, 0, 0, 0);

        const endOfLastYear = new Date(lastYear.getFullYear(), 11, 31); // December 31st of last year
        endOfLastYear.setHours(23, 59, 59, 999);

        currentPeriod.startDate = lastYear;
        currentPeriod.endDate = endOfLastYear;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.last30Days: {
        const lastPeriod = new Date(last30Days);
        lastPeriod.setDate(last30Days.getDate() - 30);
        lastPeriod.setHours(0, 0, 0, 0);

        const endOf30Days = new Date(date);
        endOf30Days.setHours(23, 59, 59, 999);

        currentPeriod.startDate = last30Days;
        currentPeriod.endDate = endOf30Days;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.last365Days: {
        const lastPeriod = new Date(last365Days);
        lastPeriod.setDate(last365Days.getDate() - 365);
        lastPeriod.setHours(0, 0, 0, 0);

        const endOf365Days = new Date(date);
        endOf365Days.setHours(23, 59, 59, 999);

        currentPeriod.startDate = last365Days;
        currentPeriod.endDate = endOf365Days;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.oldestDate: {
        const endOfOldest = new Date(date);
        endOfOldest.setHours(23, 59, 59, 999);

        currentPeriod.startDate = oldestDate;
        currentPeriod.endDate = endOfOldest;
        currentPeriod.lastPeriod = oldestDate;
        break;
      }
      default: {
        throw new Error(`Invalid period: ${period}`);
      }
    }
  }

  return {
    currentPeriod,
    today: date,
    thisWeek,
    lastWeek,
    thisMonth,
    lastMonth,
    thisQuarter,
    lastQuarter,
    thisYear,
    lastYear,
    last30Days,
    last365Days,
    oldestDate,
  };
};

export const getAnalysisPayload = () => {
  const payload = {
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    thisQuarter: 0,
    thisYear: 0,
    lastMonth: 0,
    lastQuarter: 0,
    lastYear: 0,
    last30Days: 0,
    last365Days: 0,
    oldestDate: 0, // Default value for oldestDate
  };

  return payload;
};

export const getEntityCounts = async <T extends ObjectLiteral>(
  service: BaseService<T>,
  whereFilter?: FindOptionsWhere<T> | null,
  startOfMonth?: Date,
  endOfMonth?: Date
) => {
  let where: FindOptionsWhere<T> = whereFilter ? { ...whereFilter } : {};

  if (startOfMonth && endOfMonth) {
    where = {
      ...where,
      createdAt: Between(startOfMonth, endOfMonth),
    };
  }

  const count = await service.getRepository().count({
    where: Object.keys(where).length > 0 ? where : undefined,
  });

  return count;
};
