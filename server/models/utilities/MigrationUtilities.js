const { DB_TABLE, TABLE_DEFAULTS } = require("../libs/dbConstants");

const addUserIdColumns = (table) => {
    table.integer(TABLE_DEFAULTS.COLUMNS.CREATED_BY.KEY);
    // table.foreign(TABLE_DEFAULTS.COLUMNS.CREATED_BY.KEY)
    //     .references(`${DB_TABLE.USER.TABLE_NAME}.${DB_TABLE.USER.COLUMNS.USER_ID.KEY}`);

    table.integer(TABLE_DEFAULTS.COLUMNS.LAST_MODIFIED_BY.KEY);
    // table.foreign(TABLE_DEFAULTS.COLUMNS.LAST_MODIFIED_BY.KEY)
    //     .references(`${DB_TABLE.USER.TABLE_NAME}.${DB_TABLE.USER.COLUMNS.USER_ID.KEY}`);
};

const addIsDeletedColumn = (table) => {
    table.boolean(TABLE_DEFAULTS.COLUMNS.IS_DELETED.KEY).defaultTo(false);
};

const addTimestampColumns = (table) => {
    table.timestamps(true, true, false);
};

const addDefaultColumnsWithoutUserInformation = (table) => {
    addIsDeletedColumn(table);
    addTimestampColumns(table);
};

const addDefaultColumns = (table) => {
    addUserIdColumns(table);
    addDefaultColumnsWithoutUserInformation(table);
};

const addUserIdAndIsDeletedColumns = (table) => {
    addIsDeletedColumn(table);
    addUserIdColumns(table);
};

module.exports = {
    addUserIdColumns,
    addIsDeletedColumn,
    addTimestampColumns,
    addDefaultColumnsWithoutUserInformation,
    addDefaultColumns,
    addUserIdAndIsDeletedColumns
};
