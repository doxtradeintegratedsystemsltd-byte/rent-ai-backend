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
  thisWeek.setDate(date.getDate() - date.getDay() + 1);

  // Calculate the start of last week (Monday)
  const lastWeek = new Date(thisWeek);
  lastWeek.setDate(thisWeek.getDate() - 7);

  const thisMonth = new Date();
  thisMonth.setMonth(date.getMonth(), 1);

  const lastMonth = new Date();
  lastMonth.setMonth(date.getMonth() - 1, 1);

  function getQuarterStart(month: number) {
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const startOfQuarter = new Date(
      Date.UTC(date.getFullYear(), quarterStartMonth, 1)
    );
    return startOfQuarter;
  }

  const thisQuarter = getQuarterStart(date.getMonth());

  const lastQuarter = new Date(thisQuarter);
  lastQuarter.setUTCMonth(thisQuarter.getUTCMonth() - 3);

  const thisYear = new Date();
  thisYear.setMonth(0, 1);

  const lastYear = new Date();
  lastYear.setFullYear(date.getFullYear() - 1, 0, 1);

  // Calculate the start of the last 30 days
  const last30Days = new Date(date);
  last30Days.setDate(date.getDate() - 30);

  // Calculate the start of the last 365 days
  const last365Days = new Date(date);
  last365Days.setDate(date.getDate() - 365);

  const oldestDate = new Date(0);

  const currentPeriod = {
    lastPeriod: lastWeek,
    startDate: thisWeek,
    endDate: date,
  };

  if (period) {
    switch (period) {
      case AnalysisPeriod.today: {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        const yesterday = new Date();
        yesterday.setDate(date.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);

        currentPeriod.startDate = startDate;
        currentPeriod.endDate = endDate;
        currentPeriod.lastPeriod = yesterday;
        break;
      }
      case AnalysisPeriod.thisWeek: {
        currentPeriod.startDate = thisWeek;
        currentPeriod.endDate = new Date(date);
        currentPeriod.lastPeriod = lastWeek;
        break;
      }
      case AnalysisPeriod.lastWeek: {
        const lastPeriod = new Date(lastWeek);
        lastPeriod.setDate(lastWeek.getDate() - 7);
        currentPeriod.startDate = lastWeek;
        currentPeriod.endDate = thisWeek;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.thisMonth: {
        currentPeriod.startDate = thisMonth;
        currentPeriod.endDate = date;
        currentPeriod.lastPeriod = lastMonth;
        break;
      }
      case AnalysisPeriod.lastMonth: {
        const lastPeriod = new Date(lastMonth);
        lastPeriod.setMonth(lastMonth.getMonth() - 1);
        currentPeriod.startDate = lastMonth;
        currentPeriod.endDate = thisMonth;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.thisQuarter: {
        currentPeriod.startDate = thisQuarter;
        currentPeriod.endDate = date;
        currentPeriod.lastPeriod = lastQuarter;
        break;
      }
      case AnalysisPeriod.lastQuarter: {
        const lastPeriod = new Date(lastQuarter);
        lastPeriod.setUTCMonth(lastQuarter.getUTCMonth() - 3);
        currentPeriod.startDate = lastQuarter;
        currentPeriod.endDate = thisQuarter;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.thisYear: {
        currentPeriod.startDate = thisYear;
        currentPeriod.endDate = date;
        currentPeriod.lastPeriod = lastYear;
        break;
      }
      case AnalysisPeriod.lastYear: {
        const lastPeriod = new Date(lastYear);
        lastPeriod.setFullYear(lastYear.getFullYear() - 1);
        currentPeriod.startDate = lastYear;
        currentPeriod.endDate = thisYear;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.last30Days: {
        const lastPeriod = new Date(last30Days);
        lastPeriod.setDate(last30Days.getDate() - 30);
        currentPeriod.startDate = last30Days;
        currentPeriod.endDate = date;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.last365Days: {
        const lastPeriod = new Date(last365Days);
        lastPeriod.setDate(last365Days.getDate() - 365);
        currentPeriod.startDate = last365Days;
        currentPeriod.endDate = date;
        currentPeriod.lastPeriod = lastPeriod;
        break;
      }
      case AnalysisPeriod.oldestDate: {
        currentPeriod.startDate = oldestDate;
        currentPeriod.endDate = date;
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

  const data = await service.findAllPaginated(
    {
      page: 0,
      size: 10,
    },
    {
      where: Object.keys(where).length > 0 ? where : undefined,
    }
  );

  return data.totalItems;
};
