export const getPagnation = (page: any, size: any) => {
  const limit = size ? +size : 20;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

export const getPagingData = <T>(
  data: { count: any; rows: T[] },
  page: string | number | undefined,
  limit: number
) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, data: rows, totalPages, currentPage, size: limit };
};

// export const createSearchFilter = <T extends Model>(
//   fields: Array<keyof InferCreationAttributes<T>>,
//   value: any
// ) => {
//   const searchFilter: Array<any> = [];

//   fields.forEach((field) => {
//     searchFilter.push({
//       [field]: {
//         [Op.like]: `%${value}%`,
//       },
//     });
//   });

//   return searchFilter;
// };

export const createSortOrder = (sortOrder?: any, sort?: any) => {
  let sortByOrder;
  if (sortOrder == 'ASC') {
    sortByOrder = 'ASC';
  } else {
    sortByOrder = 'DESC';
  }

  let sortBy: Array<string> = [];
  if (sort) {
    sortBy = [sort, sortByOrder];
  } else {
    sortBy = ['createdAt', sortByOrder];
  }

  return {
    sortByOrder,
    sortBy,
  };
};

export const createCondition = ({
  type,
  value,
  defaultCondition,
}: {
  type: any;
  value: any;
  defaultCondition: any;
}) => {
  let condition: any = {};

  if (value && type) {
    condition = {
      [type]: value,
      ...defaultCondition,
    };
  } else {
    condition = defaultCondition;
  }

  return condition;
};
