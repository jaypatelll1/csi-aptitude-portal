const PUBLIC_SCHEMA = "public";

const FIELD_TYPE = {
    STRING: "string",
    INTEGER: "integer",
    BIGINT: "bigint",
    DOUBLE: "double",
    BOOLEAN: "boolean",
    ENUM: "enum",
    JSONB: "jsonb",
    DATE: "date",
    DATETIME: "date-time"
}

const COMMON_FIELDS = {
    COLUMNS: {
        NAME: {
            KEY: "name",
            TYPE: FIELD_TYPE.STRING
        },
        DISPLAY_NAME: {
            KEY: "display_name",
            TYPE: FIELD_TYPE.STRING
        },
        UNIQUE_NAME: {
            KEY: "unique_name",
            TYPE: FIELD_TYPE.STRING
        }
    }
};

const TABLE_DEFAULTS = {
    COLUMNS: {
        CREATED_BY: {
            KEY: "created_by",
            TYPE: FIELD_TYPE.INTEGER
        },
        LAST_MODIFIED_BY: {
            KEY: "last_modified_by",
            TYPE: FIELD_TYPE.INTEGER
        },
        IS_DELETED: {
            KEY: "is_deleted",
            TYPE: FIELD_TYPE.BOOLEAN
        },
        CREATED_AT: {
            KEY: "created_at",
            TYPE: FIELD_TYPE.DATETIME
        },
        UPDATED_AT: {
            KEY: "updated_at",
            TYPE: FIELD_TYPE.DATETIME
        }
    }
};

const DB_TABLE = {
    FITNESS_APPS: {
        TABLE_NAME: "fitness_apps",
        COLUMNS: {
            FITNESS_APP_ID: {
                KEY: "fitness_app_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            FITNESS_APP_UNIQUE_NAME: {
                KEY: "fitness_app_unique_name",
                TYPE: FIELD_TYPE.STRING
            },
            FITNESS_APP_DISPLAY_NAME: {
                KEY: "fitness_app_display_name",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    ORGANIZATION: {
        TABLE_NAME: "organization",
        COLUMNS: {
            ORGANIZATION_ID: {
                KEY: "organization_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            NAME: {
                ...COMMON_FIELDS.COLUMNS.NAME,
                ALIAS: "organization_name"
            },
            DOMAINS: {
                KEY: "domains",
                TYPE: FIELD_TYPE.JSONB
            },
            COMPANY_CODE: {
                KEY: "company_code",
                TYPE: FIELD_TYPE.STRING,
            },
            LOGO_IMAGE_PATH: {
                KEY: "logo_image_path",
                TYPE: FIELD_TYPE.STRING
            },
            BANNER_IMAGE_PATH: {
                KEY: "banner_image_path",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    GROUP: {
        TABLE_NAME: "group",
        COLUMNS: {
            GROUP_ID: {
                KEY: "group_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            NAME: {
                ...COMMON_FIELDS.COLUMNS.NAME
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    USER: {
        TABLE_NAME: "user",
        COLUMNS: {
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            NAME: {
                ...COMMON_FIELDS.COLUMNS.NAME,
                ALIAS: "user_name"
            },
            EMAIL_ID: {
                KEY: "email_id",
                TYPE: FIELD_TYPE.STRING
            },
            MOBILE_NUMBER: {
                KEY: "mobile_number",
                TYPE: FIELD_TYPE.STRING
            },
            FITNESS_APP_UNIQUE_NAME: {
                KEY: "fitness_app_unique_name",
                TYPE: FIELD_TYPE.STRING
            },
            IS_DELETED: {
                ...TABLE_DEFAULTS.COLUMNS.IS_DELETED
            },
            CREATED_AT: {
                ...TABLE_DEFAULTS.COLUMNS.CREATED_AT
            },
            UPDATED_AT: {
                ...TABLE_DEFAULTS.COLUMNS.UPDATED_AT
            }
        }
    },

    USER_DETAILS: {
        TABLE_NAME: "user_details",
        COLUMNS: {
            USER_DETAILS_ID: {
                KEY: "user_details_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            FIRST_NAME: {
                KEY: "first_name",
                TYPE: FIELD_TYPE.STRING
            },
            LAST_NAME: {
                KEY: "last_name",
                TYPE: FIELD_TYPE.STRING
            },
            DATE_OF_BIRTH: {
                KEY: "date_of_birth",
                TYPE: FIELD_TYPE.STRING
            },
            GENDER: {
                KEY: "gender",
                TYPE: FIELD_TYPE.STRING,
                OPTION: [
                    "Male",
                    "Female"
                ]
            },
            EMAIL_ADDRESS: {
                KEY: "email_address",
                TYPE: FIELD_TYPE.STRING,
            },
            T_SHIRT_SIZE: {
                KEY: "t_shirt_size",
                TYPE: FIELD_TYPE.STRING,
                OPTIONS: [
                    "XXS",
                    "XS",
                    "S",
                    "M",
                    "L",
                    "XL",
                    "XXL",
                    "XXXL"
                ]
            },
            NAME_ON_T_SHIRT: {
                KEY: "name_on_t_shirt",
                TYPE: FIELD_TYPE.STRING
            },
            ADDITIONAL_CONTACT: {
                KEY: "additional_contact",
                TYPE: FIELD_TYPE.STRING
            },
            ADDRESS: {
                KEY: "address",
                TYPE: FIELD_TYPE.STRING
            },
            STATE: {
                KEY: "state",
                TYPE: FIELD_TYPE.STRING
            },
            CITY: {
                KEY: "city",
                TYPE: FIELD_TYPE.STRING
            },
            PIN_CODE: {
                KEY: "pin_code",
                TYPE: FIELD_TYPE.STRING
            },
            ORGANIZATION: {
                KEY: "organization",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    ROLE: {
        TABLE_NAME: "role",
        COLUMNS: {
            ROLE_ID: {
                KEY: "role_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            NAME: {
                ...COMMON_FIELDS.COLUMNS.NAME,
                ALIAS: "role_unique_name"
            },
            DESCRIPTION: {
                KEY: "description",
                ALIAS: "role_description",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    USER_ORGANIZATION: {
        TABLE_NAME: "user_organization",
        COLUMNS: {
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ORGANIZATION_ID: {
                KEY: "organization_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CORPORATE_EMAIL: {
                KEY: "corporate_email",
                TYPE: FIELD_TYPE.STRING
            },
            IS_EMAIL_VERIFIED: {
                KEY: "is_email_verified",
                TYPE: FIELD_TYPE.BOOLEAN
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    USER_GROUP: {
        TABLE_NAME: "user_group",
        COLUMNS: {
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            GROUP_ID: {
                KEY: "group_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    GROUP_ORGANIZATION: {
        TABLE_NAME: "group_organization",
        COLUMNS: {
            GROUP_ID: {
                KEY: "group_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ORGANIZATION_ID: {
                KEY: "organization_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    USER_ROLE: {
        TABLE_NAME: "user_role",
        COLUMNS: {
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ROLE_ID: {
                KEY: "role_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    ATTRIBUTE: {
        TABLE_NAME: "attribute"
    },

    BODY_ATTRIBUTE_DATA: {
        TABLE_NAME: "body_attribute_data",
        COLUMNS: {
            BODY_ATTRIBUTE_DATA_ID: {
                KEY: "body_attribute_data_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ATTRIBUTE_ID: {
                KEY: "attribute_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            LATEST_VALUE: {
                KEY: "latest_value",
                TYPE: FIELD_TYPE.STRING
            },
            UNIT: {
                KEY: "unit",
                TYPE: FIELD_TYPE.STRING
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ORGANIZATION_ID: {
                KEY: "organization_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    TEMPORAL_BODY_ATTRIBUTE_DATA: {
        TABLE_NAME: "temporal_body_attribute_data",
        COLUMNS: {
            TEMPORAL_BODY_ATTRIBUTE_DATA_ID: {
                KEY: "temporal_body_attribute_data_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ATTRIBUTE_ID: {
                KEY: "attribute_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            LATEST_VALUE: {
                KEY: "latest_value",
                TYPE: FIELD_TYPE.STRING
            },
            HISTORY: {
                KEY: "history",
                TYPE: FIELD_TYPE.JSONB
            },
            UNIT: {
                KEY: "unit",
                TYPE: FIELD_TYPE.STRING
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ORGANIZATION_ID: {
                KEY: "organization_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    STEPS_DATA: {
        TABLE_NAME: "steps_data",
        COLUMNS: {
            STEPS_DATA_ID: {
                KEY: "steps_data_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            FITNESS_APP_UNIQUE_NAME: {
                KEY: "fitness_app_unique_name",
                TYPE: FIELD_TYPE.STRING
            },
            TOTAL_STEPS: {
                KEY: "total_steps",
                TYPE: FIELD_TYPE.INTEGER
            },
            CREATED_AT: {
                KEY: "created_at",
                TYPE: FIELD_TYPE.DATETIME
            },
            UPDATED_AT: {
                KEY: "updated_at",
                TYPE: FIELD_TYPE.DATETIME
            }
        }
    },

    TOKENS: {
        TABLE_NAME: "tokens",
        COLUMNS: {
            FITNESS_APP_UNIQUE_NAME: {
                KEY: "fitness_app_unique_name",
                TYPE: FIELD_TYPE.STRING
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CREDENTIAL_TOKENS: {
                KEY: "credential_tokens",
                TYPE: FIELD_TYPE.JSONB
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    DATA_SOURCE: {
        TABLE_NAME: "data_source",
        COLUMNS: {
            DATA_SOURCE_ID: {
                KEY: "data_source_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            NAME: {
                ...COMMON_FIELDS.COLUMNS.NAME,
                ALIAS: "data_source_name"
            },
            UNIQUE_NAME: {
                ...COMMON_FIELDS.COLUMNS.UNIQUE_NAME
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    DATA_SOURCE_ATTRIBUTE_MAPPING: {
        TABLE_NAME: "data_source_attribute_mapping",
        COLUMNS: {
            DATA_SOURCE_ATTRIBUTE_MAPPING_ID: {
                KEY: "data_source_attribute_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_SOURCE_ID: {
                KEY: "data_source_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ATTRIBUTE_ID: {
                KEY: "attribute_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_KEY: {
                KEY: "data_key",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    CHALLENGE: {
        TABLE_NAME: "challenge",
        COLUMNS: {
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            NAME: {
                ...COMMON_FIELDS.COLUMNS.NAME
            },
            DISPLAY_NAME: {
                ...COMMON_FIELDS.COLUMNS.DISPLAY_NAME
            },
            MODE: {
                KEY: "mode",
                TYPE: FIELD_TYPE.ENUM,
                OPTIONS: [
                    "Online",
                    "Offline"
                ]
            },
            PRIME_ATTRIBUTE_ID: {
                KEY: "prime_attribute_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ATTRIBUTE_GOAL: {
                KEY: "attribute_goal",
                TYPE: FIELD_TYPE.STRING
            },
            START_DATE: {
                KEY: "start_date",
                TYPE: FIELD_TYPE.BIGINT
            },
            END_DATE: {
                KEY: "end_date",
                TYPE: FIELD_TYPE.BIGINT
            },
            REGISTRATION_START_DATE: {
                KEY: "registration_start_date",
                TYPE: FIELD_TYPE.BIGINT
            },
            REGISTRATION_END_DATE: {
                KEY: "registration_end_date",
                TYPE: FIELD_TYPE.BIGINT
            },
            DESCRIPTION: {
                KEY: "description",
                TYPE: FIELD_TYPE.JSONB
            },
            ORGANIZATION_ID: {
                KEY: "organization_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            IMAGE_FILENAME: {
                KEY: "image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            LEADERBOARD_IMAGE_URL: {
                KEY: "leaderboard_image_url",
                TYPE: FIELD_TYPE.STRING
            },
            MEDAL_ICON_IMAGE_URL: {
                KEY: "medal_icon_image_url",
                TYPE: FIELD_TYPE.STRING
            },
            T_SHIRT_ICON_IMAGE_URL: {
                KEY: "t_shirt_icon_image_url",
                TYPE: FIELD_TYPE.STRING
            },
            MEDAL_IMAGE_URL: {
                KEY: "medal_image_url",
                TYPE: FIELD_TYPE.STRING
            },
            T_SHIRT_IMAGE_URL: {
                KEY: "t_shirt_image_url",
                TYPE: FIELD_TYPE.STRING
            },
            LEADERBOARD_IMAGE_FILENAME: {
                KEY: "leaderboard_image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            MEDAL_ICON_IMAGE_FILENAME: {
                KEY: "medal_icon_image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            T_SHIRT_ICON_IMAGE_FILENAME: {
                KEY: "t_shirt_icon_image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            MEDAL_IMAGE_FILENAME: {
                KEY: "medal_image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            T_SHIRT_IMAGE_FILENAME: {
                KEY: "t_shirt_image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            CHALLENGE_STATUS: {
                KEY: "challenge_status",
                TYPE: FIELD_TYPE.ENUM,
                OPTIONS: [
                    "Draft",
                    "Publish"
                ]
            },
            SOCIAL_MEDIA_LINK: {
                KEY: "social_media_link",
                TYPE: FIELD_TYPE.STRING
            },
            PARTICIPATION_CERTIFICATE_IMAGE_FILENAME: {
                KEY: "participation_certificate_image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            ACHIEVEMENT_CERTIFICATE_IMAGE_FILENAME: {
                KEY: "achievement_certificate_image_filename",
                TYPE: FIELD_TYPE.STRING
            },
            EMAIL_SUBJECT_TEMPLATE: {
                KEY: "email_subject_template",
                TYPE: FIELD_TYPE.STRING
            },
            EMAIL_BODY_TEMPLATE: {
                KEY: "email_body_template",
                TYPE: FIELD_TYPE.STRING
            },
            CHALLENGE_ENDED: {
                KEY: "challenge_ended",
                TYPE: FIELD_TYPE.BOOLEAN
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    CHALLENGE_CAPTAIN_MAPPING: {
        TABLE_NAME: "challenge_captain_mapping",
        COLUMNS: {
            CHALLENGE_CAPTAIN_MAPPING_ID: {
                KEY: "challenge_captain_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CAPTAIN_USER_ID: {
                KEY: "captain_user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    VENUE: {
        TABLE_NAME: "venue",
        COLUMNS: {
            VENUE_ID: {
                KEY: "venue_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            VENUE_TITLE: {
                KEY: "venue_title",
                TYPE: FIELD_TYPE.STRING
            },
            ADDRESS_LINE_1: {
                KEY: "address_line_1",
                TYPE: FIELD_TYPE.STRING
            },
            ADDRESS_LINE_2: {
                KEY: "address_line_2",
                TYPE: FIELD_TYPE.STRING
            },
            CITY: {
                KEY: "city",
                TYPE: FIELD_TYPE.STRING
            },
            PIN_CODE: {
                KEY: "pin_code",
                TYPE: FIELD_TYPE.INTEGER
            },
            LATITUDE: {
                KEY: "latitude",
                TYPE: FIELD_TYPE.DOUBLE
            },
            LONGITUDE: {
                KEY: "longitude",
                TYPE: FIELD_TYPE.DOUBLE
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    CHALLENGE_VENUE_MAPPING: {
        TABLE_NAME: "challenge_venue_mapping",
        COLUMNS: {
            CHALLENGE_VENUE_MAPPING_ID: {
                KEY: "challenge_venue_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            VENUE_ID: {
                KEY: "venue_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    CHALLENGE_DATA_SOURCE_MAPPING: {
        TABLE_NAME: "challenge_data_source_mapping",
        COLUMNS: {
            CHALLENGE_DATA_SOURCE_MAPPING_ID: {
                KEY: "challenge_data_source_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_SOURCE_ID: {
                KEY: "data_source_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    CHALLENGE_DATA_SOURCE_ATTRIBUTE_MAPPING: {
        TABLE_NAME: "challenge_data_source_attribute_mapping",
        COLUMNS: {
            CHALLENGE_DATA_SOURCE_ATTRIBUTE_MAPPING_ID: {
                KEY: "challenge_data_source_attribute_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_SOURCE_ATTRIBUTE_MAPPING_ID: {
                KEY: "data_source_attribute_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    STATS: {
        TABLE_NAME: "stats",
        COLUMNS: {
            STATS_ID: {
                KEY: "stats_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_SOURCE_ATTRIBUTE_MAPPING_ID: {
                KEY: "data_source_attribute_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            STAT_DATE: {
                KEY: "stat_date",
                TYPE: FIELD_TYPE.DATE
            },
            VALUE: {
                KEY: "value",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    STATS_HISTORY: {
        TABLE_NAME: "stats_history",
        COLUMNS: {
            STATS_HISTORY_ID: {
                KEY: "stats_history_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_SOURCE_ATTRIBUTE_MAPPING_ID: {
                KEY: "data_source_attribute_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            STAT_DATE: {
                KEY: "stat_date",
                TYPE: FIELD_TYPE.DATE
            },
            VALUE: {
                KEY: "value",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    TICKET_TYPE: {
        TABLE_NAME: "ticket_type",
        COLUMNS: {
            TICKET_TYPE_ID: {
                KEY: "ticket_type_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            NAME: {
                ...COMMON_FIELDS.COLUMNS.NAME
            },
            DESCRIPTION: {
                KEY: "description",
                TYPE: FIELD_TYPE.STRING
            },
            TICKET_TYPE: {
                KEY: "ticket_type",
                TYPE: FIELD_TYPE.ENUM,
                OPTIONS: [
                    "Free",
                    "Paid"
                ]
            },
            PRICE: {
                KEY: "price",
                TYPE: FIELD_TYPE.DOUBLE
            },
            TAX_CHARGE: {
                KEY: "tax_charge",
                TYPE: FIELD_TYPE.DOUBLE
            },
            PAYMENT_GATEWAY_CHARGES: {
                KEY: "payment_gateway_charges",
                TYPE: FIELD_TYPE.DOUBLE
            },
            ADDITIONAL_CHARGES: {
                KEY: "additional_charges",
                TYPE: FIELD_TYPE.DOUBLE
            },
            TOTAL_QUANTITY: {
                KEY: "total_quantity",
                TYPE: FIELD_TYPE.INTEGER
            },
            SALE_START: {
                KEY: "sale_start",
                TYPE: FIELD_TYPE.BIGINT
            },
            SALE_END: {
                KEY: "sale_end",
                TYPE: FIELD_TYPE.BIGINT
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    CHALLENGE_TICKET_TYPE_MAPPING: {
        TABLE_NAME: "challenge_ticket_type_mapping",
        COLUMNS: {
            CHALLENGE_TICKET_TYPE_MAPPING_ID: {
                KEY: "challenge_ticket_type_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            TICKET_TYPE_ID: {
                KEY: "ticket_type_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    DISCOUNT_COUPON: {
        TABLE_NAME: "discount_coupon",
        COLUMNS: {
            DISCOUNT_COUPON_ID: {
                KEY: "discount_coupon_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_TICKET_TYPE_MAPPING_ID: {
                KEY: "challenge_ticket_type_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            COUPON_CODE: {
                KEY: "coupon_code",
                TYPE: FIELD_TYPE.STRING
            },
            DISCOUNT_PERCENT: {
                KEY: "discount_percent",
                TYPE: FIELD_TYPE.DOUBLE
            },
            DISCOUNT_START_DATE: {
                KEY: "discount_start_date",
                TYPE: FIELD_TYPE.BIGINT
            },
            DISCOUNT_END_DATE: {
                KEY: "discount_end_date",
                TYPE: FIELD_TYPE.BIGINT
            },
            COUPON_QUANTITY: {
                KEY: "coupon_quantity",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        },
        INDICES: {
            COUPON_CODE_UNIQUE_CONSTRAINT: {
                KEY: "coupon_code_unique_constraint"
            }
        }
    },

    ADDITIONAL_USER_FIELD: {
        TABLE_NAME: "additional_user_field"
    },

    ADDITIONAL_USER_FIELD_OPTIONS: {
        TABLE_NAME: "additional_user_field_options"
    },

    CHALLENGE_ADDITIONAL_USER_FIELD: {
        TABLE_NAME: "challenge_additional_user_field",
        COLUMNS: {
            CHALLENGE_ADDITIONAL_USER_FIELD_ID: {
                KEY: "challenge_additional_user_field_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ADDITIONAL_USER_FIELD_ID: {
                KEY: "additional_user_field_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            TICKET_SPECIFIC: {
                KEY: "ticket_specific",
                TYPE: FIELD_TYPE.BOOLEAN
            },
            IS_REQUIRED: {
                KEY: "is_required",
                TYPE: FIELD_TYPE.BOOLEAN
            },
            SORT_ORDER: {
                KEY: "sort_order",
                TYPE: FIELD_TYPE.INTEGER
            },
            IS_REACT_NATIVE_FIELD: {
                KEY: "is_react_native_field",
                TYPE: FIELD_TYPE.BOOLEAN
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    CHALLENGE_ADDITIONAL_USER_DATA: {
        TABLE_NAME: "challenge_additional_user_data",
        COLUMNS: {
            CHALLENGE_ADDITIONAL_USER_DATA_ID: {
                KEY: "challenge_additional_user_data_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ADDITIONAL_USER_FIELD_ID: {
                KEY: "challenge_additional_user_field_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            VALUE: {
                KEY: "value",
                TYPE: FIELD_TYPE.STRING
            },
            ...TABLE_DEFAULTS.COLUMNS
        },
        INDICES: {
            CHALLENGE_ADDITIONAL_USER_DATA_UNIQUE_CONSTRAINT: {
                KEY: "challenge_additional_user_data_unique_constraint",
            }
        }
    },

    USER_TICKET: {
        TABLE_NAME: "user_ticket",
        COLUMNS: {
            USER_TICKET_ID: {
                KEY: "user_ticket_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_TICKET_TYPE_MAPPING_ID: {
                KEY: "challenge_ticket_type_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            QUANTITY: {
                KEY: "quantity",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        },
        INDICES: {
            USER_TICKET_UNIQUE_CONSTRAINT: {
                KEY: "user_ticket_unique_constraint"
            }
        }
    },

    CHALLENGE_REGISTRATION: {
        TABLE_NAME: "challenge_registration",
        COLUMNS: {
            CHALLENGE_REGISTRATION_ID: {
                KEY: "challenge_registration_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DISCOUNT_COUPON_ID: {
                KEY: "discount_coupon_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_SOURCE_ATTRIBUTE_MAPPING_ID: {
                KEY: "data_source_attribute_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            TOTAL_AMOUNT: {
                KEY: "total_amount",
                TYPE: FIELD_TYPE.DOUBLE
            },
            PAYMENT_ID: {
                KEY: "payment_id",
                TYPE: FIELD_TYPE.STRING
            },
            PAYMENT_STATUS: {
                KEY: "payment_status",
                TYPE: FIELD_TYPE.ENUM,
                OPTIONS: [
                    "Unpaid",
                    "Successful",
                    "Failed"
                ]
            },
            REGISTRATION_COMPLETE: {
                KEY: "registration_complete",
                TYPE: FIELD_TYPE.BOOLEAN
            },
            CAPTAIN_USER_ID: {
                KEY: "captain_user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        },
        INDICES: {
            CHALLENGE_REGISTRATION_UNIQUE_CONSTRAINT: {
                KEY: "challenge_registration_unique_constraint"
            }
        }
    },

    DATA_SOURCE_TOKENS: {
        TABLE_NAME: "data_source_tokens",
        COLUMNS: {
            DATA_SOURCE_TOKENS_ID: {
                KEY: "data_source_token_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            DATA_SOURCE_ID: {
                KEY: "data_source_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            TOKENS: {
                KEY: "tokens",
                TYPE: FIELD_TYPE.JSONB
            },
            ACCESS_TOKEN: {
                KEY: "access_token",
                TYPE: FIELD_TYPE.STRING
            },
            REFRESH_TOKEN: {
                KEY: "refresh_token",
                TYPE: FIELD_TYPE.STRING
            },
            EXPIRY_TIMESTAMP: {
                KEY: "expiry_timestamp",
                TYPE: FIELD_TYPE.BIGINT
            },
            UNAUTHORIZED_TOKEN_KEY: {
                KEY: "unauthorized_token_key",
                TYPE: FIELD_TYPE.STRING
            },
            UNAUTHORIZED_TOKEN_SECRET: {
                KEY: "unauthorized_token_secret",
                TYPE: FIELD_TYPE.STRING
            },
            AUTHORIZED_TOKEN_KEY: {
                KEY: "authorized_token_key",
                TYPE: FIELD_TYPE.STRING
            },
            AUTHORIZED_TOKEN_SECRET: {
                KEY: "authorized_token_secret",
                TYPE: FIELD_TYPE.STRING
            },
            OAUTH_USER_ID: {
                KEY: "oauth_user_id",
                TYPE: FIELD_TYPE.STRING
            },
            PLATFORM: {
                KEY: "platform",
                TYPE: FIELD_TYPE.ENUM,
                OPTIONS: [
                    "Web",
                    "iOS",
                    "Android"
                ]
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    TRANSACTION_HISTORY: {
        TABLE_NAME: "transaction_history",
        COLUMNS: {
            TRANSACTION_HISTORY_ID: {
                KEY: "transaction_history_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            USER_ID: {
                KEY: "user_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_ID: {
                KEY: "challenge_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            CHALLENGE_TICKET_TYPE_MAPPING_ID: {
                KEY: "challenge_ticket_type_mapping_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            PAYMENT_ID: {
                KEY: "payment_id",
                TYPE: FIELD_TYPE.STRING
            },
            PAYMENT_STATUS: {
                KEY: "payment_status",
                TYPE: FIELD_TYPE.STRING
            },
            PRICE: {
                KEY: "price",
                TYPE: FIELD_TYPE.STRING
            },
            PURCHASE_TYPE: {
                KEY: "purchase_type",
                TYPE: FIELD_TYPE.STRING,
                OPTIONS: [
                    "New",
                    "Upgrade"
                ]
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    TICKET_TYPE_ADDITIONAL_USER_FIELD_JUNCTION: {
        TABLE_NAME: "ticket_type_additional_user_field_junction",
        COLUMNS: {
            TICKET_TYPE_ID: {
                KEY: "ticket_type_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ADDITIONAL_USER_FIELD_ID: {
                KEY: "additional_user_field_id",
                TYPE: FIELD_TYPE.INTEGER
            },
            ...TABLE_DEFAULTS.COLUMNS
        }
    },

    APP_VERSION: {
        TABLE_NAME: "app_version",
    }
};

module.exports = {
    PUBLIC_SCHEMA,
    COMMON_FIELDS,
    TABLE_DEFAULTS,
    DB_TABLE
};
