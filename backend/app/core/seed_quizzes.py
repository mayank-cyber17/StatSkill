from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.assessment import Quiz, MCQQuestion, Document
from app.models.user import User

OFFICIAL_QUIZZES = [
    {
        "course_code": "IGOT001",
        "title": "Python for Statistical Analysis & Survey Data Processing",
        "description": "Comprehensive competency assessment for iGOT001 covering Pandas, NumPy, survey weights, Laspeyres price calculation, and survey error metrics.",
        "difficulty_level": "INTERMEDIATE",
        "target_role": "Junior Statistical Officer",
        "domain": "Technical & Analytics",
        "questions": [
            {
                "question_text": "In Pandas, which method is the most memory-efficient and vectorised approach to apply stratified survey weights to a consumption expenditure column?",
                "option_a": "Iterating rows using df.iterrows() and multiplying each value",
                "option_b": "Direct vector multiplication using df['expenditure'] * df['weight']",
                "option_c": "Applying a custom Python loop with list comprehension",
                "option_d": "Converting the DataFrame to a dictionary before multiplying",
                "correct_option": "B",
                "explanation": "Vectorised arithmetic in Pandas (df['expenditure'] * df['weight']) utilizes NumPy C-level SIMD operations, which are orders of magnitude faster and memory-efficient.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "How is a weighted population mean calculated in Python using NumPy given a data array 'x' and multiplier weights 'w'?",
                "option_a": "np.mean(x * w)",
                "option_b": "np.average(x, weights=w)",
                "option_c": "np.sum(x) / np.sum(w)",
                "option_d": "np.median(x, weights=w)",
                "correct_option": "B",
                "explanation": "np.average(x, weights=w) computes the weighted arithmetic mean sum(x * w) / sum(w), accounting accurately for sampling multipliers.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "When handling National Sample Survey (NSS) unit-level microdata in Pandas, why should missing or special non-response codes (such as '9999') be cleaned before analysis?",
                "option_a": "Because Pandas automatically treats four-digit numbers as datetime objects",
                "option_b": "Because non-response numerical codes distort summary statistics like mean, standard error, and variance",
                "option_c": "Because SQLite cannot store numbers above 999",
                "option_d": "Because Python functions cannot accept integers with four digits",
                "correct_option": "B",
                "explanation": "Special codes like 9999 represent missing data or non-response in survey microdata. If not replaced with NaN, they severely bias statistical aggregates upward.",
                "bloom_level": "ANALYZE"
            },
            {
                "question_text": "Which Pandas aggregation function is used to compute district-wise total survey estimates grouped by State and District codes?",
                "option_a": "df.pivot_table(columns=['state', 'district'])",
                "option_b": "df.groupby(['state', 'district'])['weighted_exp'].sum()",
                "option_c": "df.aggregate_by(['state', 'district'])",
                "option_d": "df.filter(['state', 'district']).sum()",
                "correct_option": "B",
                "explanation": "df.groupby(['state', 'district'])['weighted_exp'].sum() performs a multi-level split-apply-combine to compute district aggregates.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "In computing the Modified Laspeyres Price Index in Python, what formula represents the index value for period t with base 0?",
                "option_a": "sum(P_t * Q_t) / sum(P_0 * Q_t) * 100",
                "option_b": "sum(P_t * Q_0) / sum(P_0 * Q_0) * 100",
                "option_c": "sum(P_t * Q_t) / sum(P_0 * Q_0) * 100",
                "option_d": "sqrt(sum(P_t * Q_0) * sum(P_t * Q_t))",
                "correct_option": "B",
                "explanation": "The Laspeyres formula uses base-period quantity weights Q_0 to evaluate current vs base price baskets: sum(P_t * Q_0) / sum(P_0 * Q_0) * 100.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What is the primary function of Python's 'statsmodels.stats.weightstats' module in official statistics?",
                "option_a": "To download external datasets from web servers",
                "option_b": "To compute weighted descriptive statistics, weighted t-tests, and confidence intervals for complex survey samples",
                "option_c": "To convert tabular data to shapefiles",
                "option_d": "To encrypt government survey databases",
                "correct_option": "B",
                "explanation": "statsmodels.stats.weightstats offers tools like DescrStatsW which compute weighted standard errors, means, and hypothesis tests for survey data.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Which command in Python checks for the presence of null or unrecorded values across all columns of a survey DataFrame?",
                "option_a": "df.iszero().all()",
                "option_b": "df.isnull().sum()",
                "option_c": "df.find_empty()",
                "option_d": "df.validate()",
                "correct_option": "B",
                "explanation": "df.isnull().sum() provides a count of missing (NaN) values per column, essential for survey quality auditing.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What is the consequence of applying Simple Random Sampling (SRS) standard error formulas to a Multi-Stage Stratified Cluster survey in Python?",
                "option_a": "It yields the exact same variance estimate",
                "option_b": "It underestimates standard errors due to positive intra-cluster correlation, leading to falsely narrow confidence intervals",
                "option_c": "It overestimates the standard errors by a factor of 100",
                "option_d": "Python throws an unhandled ZeroDivisionError",
                "correct_option": "B",
                "explanation": "Cluster sampling typically has a Design Effect (DEFF) > 1. Ignoring design stratification and clustering understates true sampling variance.",
                "bloom_level": "ANALYZE"
            },
            {
                "question_text": "Which Pandas method is best suited for merging household characteristics (Block 1) with individual member data (Block 4) using Common Household ID?",
                "option_a": "pd.concat([block1, block4], axis=0)",
                "option_b": "pd.merge(block1, block4, on='household_id', how='inner')",
                "option_c": "block1.append(block4)",
                "option_d": "block1.combine_first(block4)",
                "correct_option": "B",
                "explanation": "pd.merge on key 'household_id' joins household-level indicators with individual person records accurately.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "In a survey microdata DataFrame, why is it recommended to convert categorical columns (like 'sector': Urban/Rural, 'gender') to the 'category' dtype in Pandas?",
                "option_a": "To permanently encrypt the values",
                "option_b": "To drastically reduce RAM consumption and speed up grouping and filtering operations",
                "option_c": "To convert the columns to floating point numbers",
                "option_d": "To avoid having to specify column headers",
                "correct_option": "B",
                "explanation": "Categorical dtypes store repeating strings as integer codes with a lookup table, drastically reducing memory usage when processing millions of survey records.",
                "bloom_level": "UNDERSTAND"
            }
        ]
    },
    {
        "course_code": "IGOT002",
        "title": "R Programming & Statistical Computing for Statisticians",
        "description": "Official competency assessment for iGOT002 covering R data structures, ggplot2 survey visualization, dplyr wrangling, and survey sampling packages.",
        "difficulty_level": "BEGINNER",
        "target_role": "Statistical Investigator",
        "domain": "Technical & Analytics",
        "questions": [
            {
                "question_text": "Which R package is the gold standard for analyzing complex survey samples with stratification, clustering, and unequal sampling weights?",
                "option_a": "ggplot2",
                "option_b": "survey",
                "option_c": "shiny",
                "option_d": "caret",
                "correct_option": "B",
                "explanation": "The 'survey' package by Thomas Lumley provides svydesign and summary estimators tailored for complex multi-stage official surveys.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "In tidyverse/dplyr, which pipe operator is traditionally used to chain data transformations in R?",
                "option_a": "->>",
                "option_b": "%>%",
                "option_c": "::",
                "option_d": "===",
                "correct_option": "B",
                "explanation": "The magrittr pipe operator %>% (and the native |> in modern R) passes the output of the preceding expression as the first argument of the next function.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Which function in R's 'survey' package initializes a survey design object specifying primary sampling units (PSUs), strata, and sampling weights?",
                "option_a": "svycreate()",
                "option_b": "svydesign()",
                "option_c": "svysample()",
                "option_d": "svysetup()",
                "correct_option": "B",
                "explanation": "svydesign(ids=~psu, strata=~stratum, weights=~multiplier, data=df) creates the survey design object.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "What ggplot2 geom function is used to produce density histograms of household monthly per capita expenditure (MPCE)?",
                "option_a": "geom_point()",
                "option_b": "geom_histogram()",
                "option_c": "geom_line()",
                "option_d": "geom_polygon()",
                "correct_option": "B",
                "explanation": "geom_histogram() partitions continuous numerical data into bins and visualizes frequency distributions.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "In R, what is the key difference between a 'matrix' and a 'data.frame'?",
                "option_a": "A matrix can contain multiple data types while a data.frame cannot",
                "option_b": "A matrix is strictly homogeneous (all elements of the same type), whereas a data.frame can contain columns of different data types",
                "option_c": "A data.frame can only have two rows",
                "option_d": "A matrix cannot have row names",
                "correct_option": "B",
                "explanation": "Matrices require uniform data types (e.g., all numeric), whereas data.frames hold tabular heterogeneous vectors (numeric, factor, character).",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Which dplyr verb is used to compute summary statistics (such as mean and median) across grouped subgroups of survey respondents?",
                "option_a": "mutate()",
                "option_b": "summarise() (or summarize())",
                "option_c": "select()",
                "option_d": "arrange()",
                "correct_option": "B",
                "explanation": "summarise() reduces multiple values down to a single summary statistic per group when combined with group_by().",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "How do you filter records in a survey data frame where Sector is 'Rural' and Land_Owned is greater than 2 hectares in R?",
                "option_a": "filter(df, Sector == 'Rural' & Land_Owned > 2)",
                "option_b": "select(df, Sector == 'Rural' | Land_Owned > 2)",
                "option_c": "subset(df, Sector = 'Rural' and Land_Owned > 2)",
                "option_d": "arrange(df, Sector == 'Rural')",
                "correct_option": "A",
                "explanation": "dplyr::filter evaluates logical conditions using == for equality and & for logical AND.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "What does the function 'svymean(~income, design)' return when executed on a valid survey design object?",
                "option_a": "Only the raw arithmetic mean without weights",
                "option_b": "The design-based weighted mean estimate along with its design standard error",
                "option_c": "The maximum and minimum income values",
                "option_d": "The median household identifier",
                "correct_option": "B",
                "explanation": "svymean computes the survey-weighted mean point estimate and the Taylor-series linearized standard error.",
                "bloom_level": "ANALYZE"
            },
            {
                "question_text": "Which R command is used to read large delimited CSV microdata files with maximum parsing speed?",
                "option_a": "read.csv() from base R",
                "option_b": "read_csv() from readr or fread() from data.table",
                "option_c": "scan() with manual indexing",
                "option_d": "load.table()",
                "correct_option": "B",
                "explanation": "readr::read_csv and data.table::fread are optimized in C/C++ to ingest large government survey files up to 10-20x faster than base read.csv.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "In R ggplot2, what layer is added to split a chart into multiple subplots based on State or Social Group category?",
                "option_a": "coord_flip()",
                "option_b": "facet_wrap(~state) or facet_grid()",
                "option_c": "scale_x_continuous()",
                "option_d": "theme_minimal()",
                "correct_option": "B",
                "explanation": "facet_wrap(~variable) creates a grid of small multiple plots conditioned on discrete factor variables.",
                "bloom_level": "APPLY"
            }
        ]
    },
    {
        "course_code": "IGOT005",
        "title": "Consumer Price Index (CPI) Weighting & Laspeyres Formula",
        "description": "Core official statistics competency test on All-India CPI (Combined, Rural, Urban), Laspeyres aggregation, and price collection protocols.",
        "difficulty_level": "EASY",
        "target_role": "Statistical Assistant",
        "domain": "Official Statistics",
        "questions": [
            {
                "question_text": "What is the base year currently utilized by MoSPI for compiling the All-India Consumer Price Index (CPI)?",
                "option_a": "2004-05 = 100",
                "option_b": "2011-12 = 100",
                "option_c": "2012 = 100",
                "option_d": "2001 = 100",
                "correct_option": "C",
                "explanation": "MoSPI revised the All-India CPI (Rural, Urban, Combined) base year to 2012=100 starting from the January 2015 release.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Which commodity group carries the largest weight in the All-India CPI (Combined) consumption basket?",
                "option_a": "Fuel and Light (~6.84%)",
                "option_b": "Food and Beverages (~45.86%)",
                "option_c": "Housing (~10.07%)",
                "option_d": "Clothing and Footwear (~6.53%)",
                "correct_option": "B",
                "explanation": "Food and Beverages constitutes approximately 45.86% of the headline CPI (Combined) basket, making headline inflation sensitive to food prices.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "In the compilation of CPI, how is the expenditure weighting diagram derived?",
                "option_a": "From Annual Survey of Industries (ASI)",
                "option_b": "From Consumer Expenditure Surveys (CES) conducted by NSSO",
                "option_c": "From Income Tax return filings",
                "option_d": "From import-export customs records",
                "correct_option": "B",
                "explanation": "The consumption basket weights are derived from representative nationwide household Consumer Expenditure Surveys (CES).",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Why is the Housing group index calculated only for the Urban sector in the All-India CPI series?",
                "option_a": "Because rural households do not own dwellings",
                "option_b": "Because rental transactions and rented housing markets are largely unorganized or negligible in rural areas",
                "option_c": "Because rural housing is subsidized by international agencies",
                "option_d": "Because urban households do not consume food products",
                "correct_option": "B",
                "explanation": "House rent index is compiled exclusively for the Urban CPI because the rental housing market in rural areas lacks standardized market transactions.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What mathematical index formula is employed at the elementary aggregate level to compute item price relatives?",
                "option_a": "Geometric mean of price relatives (Jevons Index) or ratio of arithmetic averages (Dutot Index)",
                "option_b": "Harmonic mean of quantities",
                "option_c": "Logarithmic regression",
                "option_d": "Quadratic root mean square",
                "correct_option": "A",
                "explanation": "Elementary price indices without quantity weights are compiled using the Dutot or Jevons formulas before aggregation via Laspeyres.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is the statutory inflation target assigned to the RBI Monetary Policy Committee (MPC) using CPI Combined?",
                "option_a": "2% with tolerance band of +/- 1%",
                "option_b": "4% with a tolerance band of +/- 2% (i.e. 2% to 6%)",
                "option_c": "5% constant rate",
                "option_d": "Zero inflation rate",
                "correct_option": "B",
                "explanation": "Under the flexible inflation targeting framework of the RBI Act, the target is 4% headline CPI Combined with a tolerance band of 2% to 6%.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What does 'Core Inflation' exclude from the Headline CPI basket?",
                "option_a": "Manufacturing and Services",
                "option_b": "Food and Fuel items due to their high volatility",
                "option_c": "Housing and Education",
                "option_d": "All imported goods",
                "correct_option": "B",
                "explanation": "Core inflation excludes volatile food and fuel categories to capture underlying persistent price pressures in the economy.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Which organization is responsible for compiling the Wholesale Price Index (WPI) in India, distinguishing it from CPI?",
                "option_a": "MoSPI (National Statistical Office)",
                "option_b": "Office of Economic Adviser, DPIIT (Ministry of Commerce and Industry)",
                "option_c": "Reserve Bank of India",
                "option_d": "Department of Consumer Affairs",
                "correct_option": "B",
                "explanation": "WPI is released by the Office of the Economic Adviser (DPIIT), Ministry of Commerce and Industry, whereas CPI is released by MoSPI.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "When a specified commodity brand becomes permanently unavailable in a survey market, what statistical procedure is followed?",
                "option_a": "The item weight is set to zero forever",
                "option_b": "An item substitution protocol is triggered, linking prices using overlap pricing or comparable specification quality adjustment",
                "option_c": "The market data collector is penalized",
                "option_d": "The entire group index is eliminated",
                "correct_option": "B",
                "explanation": "When an item becomes obsolete or unavailable, price collectors follow replacement protocols using comparable specifications to avoid price discontinuity.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "How does base-year chaining (Chained Laspeyres) improve over fixed-base Laspeyres indices?",
                "option_a": "It fixes expenditure weights permanently for 50 years",
                "option_b": "It updates consumption weights and item baskets annually to eliminate substitution bias",
                "option_c": "It eliminates the need to collect field prices",
                "option_d": "It requires only a single respondent across the nation",
                "correct_option": "B",
                "explanation": "Chaining allows regular updates of weights and rapid incorporation of new products, reducing substitution bias.",
                "bloom_level": "ANALYZE"
            }
        ]
    },
    {
        "course_code": "IGOT013",
        "title": "National Accounts Statistics & GDP Estimation Methodology",
        "description": "Technical assessment on the UN System of National Accounts (SNA 2008) framework, Gross Value Added (GVA), and factor price relationships in India.",
        "difficulty_level": "MEDIUM",
        "target_role": "Senior Statistical Officer",
        "domain": "National Accounts",
        "questions": [
            {
                "question_text": "Under the 2011-12 National Accounts methodology, what is the headline measure of economic growth used in India?",
                "option_a": "GDP at Factor Cost",
                "option_b": "GDP at Constant Market Prices",
                "option_c": "Net Domestic Product at Factor Cost",
                "option_d": "National Disposable Income",
                "correct_option": "B",
                "explanation": "In alignment with SNA 2008, headline GDP in India is compiled at constant market prices, replacing the earlier practice of GDP at factor cost.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Which formula correctly expresses Gross Domestic Product (GDP) at Market Prices in terms of Gross Value Added (GVA) at Basic Prices?",
                "option_a": "GDP = GVA at basic prices - Product Taxes + Product Subsidies",
                "option_b": "GDP = GVA at basic prices + Product Taxes - Product Subsidies",
                "option_c": "GDP = GVA at factor cost + Net Factor Income from Abroad",
                "option_d": "GDP = GVA at basic prices × Wholesale Price Deflator",
                "correct_option": "B",
                "explanation": "GDP at market prices equals GVA at basic prices plus net taxes on products (product taxes minus product subsidies).",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "How does 'GVA at Basic Prices' differ from 'GVA at Factor Cost'?",
                "option_a": "Basic prices add Net Production Taxes (Production Taxes minus Production Subsidies)",
                "option_b": "Basic prices subtract Net Production Taxes",
                "option_c": "There is zero conceptual or mathematical difference",
                "option_d": "Basic prices exclude employee compensation",
                "correct_option": "A",
                "explanation": "GVA at basic prices = GVA at factor cost + (Production Taxes - Production Subsidies). Production taxes (land revenue, stamp duty) are independent of production volume.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Which administrative database was introduced in the 2011-12 series to expand coverage of the corporate manufacturing and services sector?",
                "option_a": "UIDAI Aadhaar Registry",
                "option_b": "Ministry of Corporate Affairs (MCA-21) electronic database",
                "option_c": "Civil Registration System (CRS)",
                "option_d": "EPFO active payroll records",
                "correct_option": "B",
                "explanation": "The MCA-21 database provided audited financial statements of hundreds of thousands of registered companies, replacing the earlier RBI sample blow-up method.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What does FISIM stand for in the context of National Accounts compilation?",
                "option_a": "Financial Investment Securities Index Metric",
                "option_b": "Financial Intermediation Services Indirectly Measured",
                "option_c": "Federal Interest Stabilization and Inflation Measure",
                "option_d": "Fixed Income Sovereign Instrument Model",
                "correct_option": "B",
                "explanation": "FISIM represents the value of financial intermediation services provided by banks through interest rate margins between deposits and loans.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Which method is primarily used to estimate GVA in agriculture, forestry, and fishing in India's National Accounts?",
                "option_a": "Income Approach",
                "option_b": "Production (Output) Approach",
                "option_c": "Expenditure Approach",
                "option_d": "Asset Recovery Approach",
                "correct_option": "B",
                "explanation": "Agriculture utilizes the Production Approach: multiplying gross physical output quantities by farm harvest prices and deducting intermediate consumption inputs.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is the relationship between Gross Domestic Product (GDP) and Gross National Product (GNP)?",
                "option_a": "GNP = GDP - Depreciation",
                "option_b": "GNP = GDP + Net Factor Income from Abroad (NFIA)",
                "option_c": "GNP = GDP - Indirect Taxes",
                "option_d": "GNP = GDP + Government Transfer Payments",
                "correct_option": "B",
                "explanation": "GNP accounts for income earned by domestic residents from economic activities abroad minus income earned by foreigners domestically (NFIA).",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "What economic concept does the 'GDP Deflator' represent?",
                "option_a": "The ratio of Nominal GDP to Real GDP multiplied by 100",
                "option_b": "The annual percentage growth of the money supply",
                "option_c": "The trade balance deficit divided by foreign exchange reserves",
                "option_d": "The consumer price change for urban manual workers",
                "correct_option": "A",
                "explanation": "GDP Deflator = (Nominal GDP / Real GDP) * 100. It is a comprehensive measure of price inflation across all domestically produced goods and services.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "In the expenditure approach to GDP, what are the four major components summed together?",
                "option_a": "Wages + Rent + Interest + Profit",
                "option_b": "PFCE + GFCE + GCF + Net Exports (X - M)",
                "option_c": "Direct Taxes + Indirect Taxes + Customs + Non-tax Revenue",
                "option_d": "GVA Agriculture + GVA Industry + GVA Services + Discrepancies",
                "correct_option": "B",
                "explanation": "GDP (Expenditure) = Private Final Consumption Expenditure (PFCE) + Government Final Consumption Expenditure (GFCE) + Gross Capital Formation (GCF) + Net Exports.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What does 'Consumption of Fixed Capital' (CFC) measure in National Accounts Statistics?",
                "option_a": "Consumer purchases of kitchen appliances",
                "option_b": "The decline in current value of fixed capital stock due to normal wear and tear and obsolescence (Depreciation)",
                "option_c": "Government expenditures on defense infrastructure",
                "option_d": "Bank loans written off as non-performing assets",
                "correct_option": "B",
                "explanation": "CFC is the national accounting term for economic depreciation of reproducible fixed assets over their expected productive lifespan.",
                "bloom_level": "UNDERSTAND"
            }
        ]
    },
    {
        "course_code": "IGOT011",
        "title": "Survey Sampling Theory & NSSO Multi-Stage Methodology",
        "description": "Technical assessment on stratified multi-stage probability sampling, UFS urban blocks, design effects, and non-sampling error control in NSS.",
        "difficulty_level": "HARD",
        "target_role": "Statistical Officer",
        "domain": "Survey Methodology",
        "questions": [
            {
                "question_text": "In rural areas of India, what administrative geographical entity traditionally acts as the First Stage Unit (FSU) in National Sample Surveys?",
                "option_a": "Revenue Tehsil",
                "option_b": "Census Village",
                "option_c": "Panchayat Ward",
                "option_d": "Development Block",
                "correct_option": "B",
                "explanation": "In NSS rounds, Census villages (as per the latest available Population Census frame) serve as the First Stage Units (FSUs) for rural samples.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What sampling frame is maintained and updated by the Field Operations Division (FOD) of NSSO for urban sampling?",
                "option_a": "Municipal Electoral Registry",
                "option_b": "Urban Frame Survey (UFS) Blocks",
                "option_c": "Postal Pincode Directories",
                "option_d": "Electricity Meter Account Roll",
                "correct_option": "B",
                "explanation": "The Urban Frame Survey (UFS) partitions towns and cities into compact, identifiable blocks of 100-150 households, continuously updated every 5 years.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What is the Ultimate Stage Unit (USU) in socio-economic surveys like PLFS or Consumer Expenditure Surveys?",
                "option_a": "Individual citizen",
                "option_b": "Household",
                "option_c": "Village Council",
                "option_d": "District administrative office",
                "correct_option": "B",
                "explanation": "The household is the USU from which detailed socio-economic, expenditure, or employment schedules are canvassed.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What does a 'Design Effect' (DEFF) of 2.5 indicate when evaluating a survey estimate?",
                "option_a": "The sample was 2.5 times larger than required",
                "option_b": "The variance under the complex multi-stage design is 2.5 times higher than the variance of an equal-sized Simple Random Sample",
                "option_c": "Non-sampling error accounts for 25% of total error",
                "option_d": "The response rate was 40%",
                "correct_option": "B",
                "explanation": "DEFF = Var(complex) / Var(SRS). DEFF=2.5 reflects the variance penalty due to cluster sampling and unequal weighting.",
                "bloom_level": "ANALYZE"
            },
            {
                "question_text": "In stratified random sampling, what is 'Neyman Allocation' designed to accomplish?",
                "option_a": "Equalize the number of sample units across all strata",
                "option_b": "Minimize the sampling variance of the estimated mean for a fixed overall sample size, allocating more sample to larger and more variable strata",
                "option_c": "Ensure that only rural strata are surveyed",
                "option_d": "Randomize the interviewer assignment order",
                "correct_option": "B",
                "explanation": "Neyman optimal allocation proportions n_h proportional to N_h * S_h (stratum size times stratum standard deviation), achieving minimum variance.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "Which of the following is categorized as a 'Non-Sampling Error' in a nationwide household survey?",
                "option_a": "Sampling variance due to finite sample size",
                "option_b": "Recall lapse and respondent response bias during dietary expenditure reporting",
                "option_c": "Standard error of the Horvitz-Thompson estimator",
                "option_d": "Margin of error computed at 95% confidence",
                "correct_option": "B",
                "explanation": "Non-sampling errors arise during data collection, coding, frame omission, or recall decay, occurring even if an entire census was surveyed.",
                "bloom_level": "ANALYZE"
            },
            {
                "question_text": "Why does NSSO divide national survey samples into two independent matched sub-samples (Sub-sample 1 and Sub-sample 2)?",
                "option_a": "To allow one sub-sample to be discarded if weather conditions are bad",
                "option_b": "To provide independent parallel estimates of all population parameters and facilitate quick calculation of sampling errors",
                "option_c": "To assign one to central government and one to foreign agencies",
                "option_d": "To test two completely different survey questionnaires",
                "correct_option": "B",
                "explanation": "Interpenetrating sub-samples enable direct empirical estimation of survey variance without calculating complex second-order inclusion probabilities.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is the sampling weight (multiplier) of a sample household selected with an inclusion probability of 1 in 2,500?",
                "option_a": "0.0004",
                "option_b": "2,500",
                "option_c": "250",
                "option_d": "50",
                "correct_option": "B",
                "explanation": "The design multiplier is the inverse of the inclusion probability: W_i = 1 / pi_i = 1 / (1/2500) = 2,500.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "In the Periodic Labour Force Survey (PLFS), how often are urban rotational panel sample households revisited?",
                "option_a": "Once every 5 years",
                "option_b": "Four visits (one initial visit and three quarterly revisits under a rotational panel design)",
                "option_c": "Every single month for ten years",
                "option_d": "Only once with zero revisits",
                "correct_option": "B",
                "explanation": "PLFS urban households are surveyed under a rotational panel scheme: an initial visit followed by 3 quarterly revisits (75% panel rotation).",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What technique is used in large FSUs when the number of households exceeds 300 to keep listing manageable?",
                "option_a": "The entire village is dropped from the sample",
                "option_b": "Sub-division into Hamlet-Groups (rural) or Sub-Blocks (urban) followed by random selection of sample hamlet-groups",
                "option_c": "Immediate census enumeration of all households",
                "option_d": "Random telephone digit dialing",
                "correct_option": "B",
                "explanation": "When an FSU is large, it is demarcated into equal-sized hamlet-groups (or sub-blocks) and two are randomly selected for household listing.",
                "bloom_level": "UNDERSTAND"
            }
        ]
    },
    {
        "course_code": "IGOT006",
        "title": "Cybersecurity Guidelines & Government Data Privacy",
        "description": "Essential assessment on the Digital Personal Data Protection (DPDP) Act 2023, CERT-In government directives, and statistical microdata anonymization.",
        "difficulty_level": "MEDIUM",
        "target_role": "All Statistical Cadres",
        "domain": "Digital Governance",
        "questions": [
            {
                "question_text": "Under the Digital Personal Data Protection (DPDP) Act 2023, what is an entity that processes digital personal data on behalf of a data fiduciary called?",
                "option_a": "Data Trustee",
                "option_b": "Data Processor",
                "option_c": "Information Guardian",
                "option_d": "Cyber Regulator",
                "correct_option": "B",
                "explanation": "Under the DPDP Act 2023, a Data Processor is any person or entity that processes personal data on behalf of a Data Fiduciary.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What is the timeline mandated by CERT-In for government organizations to report cybersecurity incidents?",
                "option_a": "Within 6 hours of noticing the incident",
                "option_b": "Within 30 calendar days",
                "option_c": "Within 7 business days",
                "option_d": "Only during annual audit reporting",
                "correct_option": "A",
                "explanation": "The CERT-In Cyber Security Directions mandate reporting of specified cyber incidents within 6 hours of notice.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Which statistical disclosure limitation technique ensures that an individual's survey microdata record cannot be re-identified by combining quasi-identifiers?",
                "option_a": "k-anonymity and l-diversity",
                "option_b": "Linear regression extrapolation",
                "option_c": "Base-period rebasing",
                "option_d": "Stratified multiplier inflation",
                "correct_option": "A",
                "explanation": "k-anonymity ensures each combination of quasi-identifiers (age, gender, district) is shared by at least k individuals in the released dataset.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is 'Differential Privacy' mathematically designed to guarantee when releasing query results on government microdata?",
                "option_a": "That all queries execute within 10 milliseconds",
                "option_b": "That the presence or absence of any single individual in the database has a bounded, negligible impact on the output distribution",
                "option_c": "That data files are stored on magnetic tape",
                "option_d": "That passwords are changed every week",
                "correct_option": "B",
                "explanation": "Differential privacy injects calibrated noise (e.g., Laplace or Gaussian) so that aggregate outputs provide strong mathematical privacy bounds for individuals.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Why should official government survey datasets never be stored or transferred over unencrypted public protocols (such as plain FTP or HTTP)?",
                "option_a": "Because HTTP is faster than HTTPS",
                "option_b": "To prevent eavesdropping, man-in-the-middle data tampering, and unauthorized interception of sensitive respondent microdata",
                "option_c": "Because modern operating systems disable network cards on plain HTTP",
                "option_d": "Because spreadsheets cannot be viewed in web browsers",
                "correct_option": "B",
                "explanation": "Unencrypted channels expose confidential survey records to packet sniffing and tampering, violating government information security policies.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "What is Multi-Factor Authentication (MFA) and why is it mandatory for government portal logins?",
                "option_a": "Requiring multiple users to share a single password",
                "option_b": "Requiring two or more distinct verification factors (e.g. password + OTP/hardware token) to prevent unauthorized credential breaches",
                "option_c": "Entering the password twice on the same page",
                "option_d": "Logging in from two computers at the same time",
                "correct_option": "B",
                "explanation": "MFA requires evidence from different categories (something you know, something you have, or something you are), mitigating stolen password attacks.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Under the Collection of Statistics Act 2008, what is the legal obligation regarding the confidentiality of individual statistical returns?",
                "option_a": "They may be disclosed freely to private commercial companies",
                "option_b": "They are strictly confidential and cannot be used as evidence in non-statistical court proceedings or for tax assessments",
                "option_c": "They must be printed in local newspapers",
                "option_d": "They can be shared on social media after 1 year",
                "correct_option": "B",
                "explanation": "The Collection of Statistics Act provides statutory confidentiality, prohibiting the use of individual respondent returns for taxation or non-statistical enforcement.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is a 'Phishing' attack in the context of government cybersecurity?",
                "option_a": "Searching for open-source statistical code repositories",
                "option_b": "Deceptive emails or communications mimicking official authorities to lure employees into disclosing credentials or installing malware",
                "option_c": "Upgrading server operating system kernels",
                "option_d": "Scanning paper schedules into PDF format",
                "correct_option": "B",
                "explanation": "Phishing is a social engineering attack where fraudulent messages mimic legitimate institutions to steal credentials or compromise systems.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What does data anonymization by 'Top-Coding' involve when releasing income or expenditure microdata?",
                "option_a": "Placing the highest earners at the top of the spreadsheet",
                "option_b": "Capping values above a threshold (e.g. income > ₹5,00,000/month replaced with '₹5,00,000+') to prevent outlier identification",
                "option_c": "Deleting the top 10 rows of every survey block",
                "option_d": "Sorting the data in ascending alphabetical order",
                "correct_option": "B",
                "explanation": "Top-coding replaces extreme outlier values with a fixed ceiling value, preventing wealthy or prominent outliers from being identifiable.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "What is the recommended practice when official survey laptops or mobile tablets (CAPI devices) are decommissioned or reassigned?",
                "option_a": "Simply dragging files to the Recycle Bin",
                "option_b": "Performing cryptographic wipe or certified secure sanitization of storage media according to government guidelines",
                "option_c": "Disconnecting the battery for 10 minutes",
                "option_d": "Renaming the user profile folder",
                "correct_option": "B",
                "explanation": "Standard file deletion leaves data recoverable. Secure cryptographic sanitization overwrites data to prevent residual data leakage.",
                "bloom_level": "UNDERSTAND"
            }
        ]
    },
    {
        "course_code": "IGOT007",
        "title": "Time Series Analysis & Economic Forecasting",
        "description": "Advanced assessment on ARIMA/SARIMA models, seasonal decomposition (X-12/X-13 ARIMA), stationarity testing, and HP filters for official economic series.",
        "difficulty_level": "HARD",
        "target_role": "Director / Statistical Officer",
        "domain": "Technical & Analytics",
        "questions": [
            {
                "question_text": "Which statistical hypothesis test is standardly used to evaluate whether an economic time series possesses a unit root (is non-stationary)?",
                "option_a": "Student's paired t-test",
                "option_b": "Augmented Dickey-Fuller (ADF) Test",
                "option_c": "Pearson Chi-Square test of independence",
                "option_d": "Levene's test of homogeneity of variance",
                "correct_option": "B",
                "explanation": "The Augmented Dickey-Fuller (ADF) test tests the null hypothesis that a unit root is present in a time series sample.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "In an ARIMA(p, d, q) model specification, what does the parameter 'd' represent?",
                "option_a": "The number of autoregressive lags",
                "option_b": "The order of differencing required to achieve stationarity",
                "option_c": "The number of moving average terms",
                "option_d": "The seasonal periodicity in months",
                "correct_option": "B",
                "explanation": "In ARIMA(p, d, q), 'd' represents the order of integration/differencing needed to convert a non-stationary series to stationarity.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Why do official statistical agencies (such as MoSPI and US BLS) seasonally adjust monthly Index of Industrial Production (IIP) series?",
                "option_a": "To eliminate long-term demographic trend growth",
                "option_b": "To remove recurring calendar and weather effects (like Diwali dates, monsoon lulls, working-day differences) to reveal underlying cyclical trends",
                "option_c": "To reduce the file size of published press releases",
                "option_d": "To equalize prices across all Indian states",
                "correct_option": "B",
                "explanation": "Seasonal adjustment isolates calendar, holiday, and weather effects, enabling true month-on-month and quarter-on-quarter economic momentum evaluation.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is the Hodrick-Prescott (HP) filter commonly used for in central bank and official macroeconomic analysis?",
                "option_a": "To detect outlier data entry typos",
                "option_b": "To decompose real GDP series into a smooth trend component and cyclical output gap component",
                "option_c": "To predict exchange rates 10 years into the future",
                "option_d": "To impute missing survey weights",
                "correct_option": "B",
                "explanation": "The HP filter separates cyclical fluctuations from trend growth, providing estimates of potential output and the output gap.",
                "bloom_level": "APPLY"
            },
            {
                "question_text": "If a time series has a constant mean and variance over time and its autocovariance depends only on lag length, what is it called?",
                "option_a": "A deterministic trend",
                "option_b": "A weakly (covariance) stationary process",
                "option_c": "A random walk with drift",
                "option_d": "An explosive autoregressive process",
                "correct_option": "B",
                "explanation": "Weak stationarity requires a constant mean, finite constant variance, and autocovariances that depend solely on time lag (t - s).",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Which information criterion is most widely used to penalize model complexity when selecting optimal lag length in ARMA models?",
                "option_a": "R-squared value",
                "option_b": "Akaike Information Criterion (AIC) / Bayesian Information Criterion (BIC)",
                "option_c": "F-statistic probability",
                "option_d": "Standard deviation of the sample",
                "correct_option": "B",
                "explanation": "AIC and BIC trade off goodness-of-fit (log-likelihood) against model parsimony with an explicit penalty for additional estimated parameters.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What behavior does a pure Autoregressive process of order 1, AR(1): X_t = 0.8 * X_{t-1} + e_t, exhibit in its Autocorrelation Function (ACF)?",
                "option_a": "Sharp cutoff to zero after lag 1",
                "option_b": "Exponential geometric decay towards zero as lags increase",
                "option_c": "Constant value of 1.0 at all lags",
                "option_d": "Sinusoidal oscillation with infinite variance",
                "correct_option": "B",
                "explanation": "For stationary AR(1) processes, the ACF decays geometrically (rho_k = phi^k), while the PACF cuts off cleanly after lag 1.",
                "bloom_level": "ANALYZE"
            },
            {
                "question_text": "What does a significant Ljung-Box Q-test p-value (p < 0.05) on the residuals of an ARIMA model signify?",
                "option_a": "The model residuals are pure white noise and the model is optimal",
                "option_b": "Significant autocorrelation remains in the residuals, indicating model misspecification",
                "option_c": "The sample size is too small to calculate statistics",
                "option_d": "The dependent variable has zero variance",
                "correct_option": "B",
                "explanation": "The Ljung-Box test tests the null hypothesis of independence in residuals. Rejecting H0 (p < 0.05) implies unmodeled autocorrelation remains.",
                "bloom_level": "ANALYZE"
            },
            {
                "question_text": "What is 'Spurious Regression' in econometrics?",
                "option_a": "A regression computed with non-numeric text variables",
                "option_b": "Finding statistically significant R-squared and t-statistics between two independent non-stationary series that have no true causal relationship",
                "option_c": "A regression where the constant term is exactly zero",
                "option_d": "A model evaluated on fewer than 5 observations",
                "correct_option": "B",
                "explanation": "Regressing two independent random walk series produces high R^2 and significant t-stats due to common trends (Granger & Newbold 1974).",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Which methodology enables valid long-run regression analysis between non-stationary series without first-differencing away long-run equilibrium relationships?",
                "option_a": "Cointegration analysis (e.g. Engle-Granger or Johansen cointegration tests)",
                "option_b": "Logarithmic percentage changes",
                "option_c": "Simple moving averages",
                "option_d": "Polynomial curve fitting",
                "correct_option": "A",
                "explanation": "Cointegration identifies linear combinations of I(1) series that are stationary I(0), capturing true structural long-run equilibria.",
                "bloom_level": "APPLY"
            }
        ]
    },
    {
        "course_code": "IGOT008",
        "title": "Official Statistics Governance & National Statistical Commission Framework",
        "description": "Comprehensive review of the Rangarajan Commission recommendations, MoSPI organizational structure, UN Fundamental Principles of Official Statistics, and NSC audit standards.",
        "difficulty_level": "INTERMEDIATE",
        "target_role": "Assistant Director / Senior Official",
        "domain": "Governance & Policy",
        "questions": [
            {
                "question_text": "Which landmark commission recommended the establishment of an independent, permanent National Statistical Commission (NSC) in India?",
                "option_a": "Sarkaria Commission",
                "option_b": "Dr. C. Rangarajan Commission (National Statistical Commission 2001)",
                "option_c": "Kothari Commission",
                "option_d": "First Finance Commission",
                "correct_option": "B",
                "explanation": "The Rangarajan Commission (2001) comprehensively reviewed the Indian Statistical System and recommended creating the apex National Statistical Commission.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What is the primary role of the National Statistical Commission (NSC)?",
                "option_a": "To collect taxes from foreign corporations",
                "option_b": "To serve as the apex advisory and policy-making body overseeing statistical standards, data quality, and inter-agency coordination in India",
                "option_c": "To manage the salaries of civil services personnel",
                "option_d": "To audit military defense procurement",
                "correct_option": "B",
                "explanation": "The NSC is mandated to evolve statistical policies, standards, and methodologies across central and state statistical agencies to ensure data integrity.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "Under the UN Fundamental Principles of Official Statistics, what does Principle 1 ('Relevance, Impartiality, and Equal Access') mandate?",
                "option_a": "Official statistics must be compiled solely for the ruling political party",
                "option_b": "Official statistics that meet the test of practical utility are to be compiled and made available on an impartial basis to all citizens equally",
                "option_c": "Statistical releases should only be shared with licensed private companies",
                "option_d": "Only state capitals should receive economic bulletins",
                "correct_option": "B",
                "explanation": "Principle 1 establishes official statistics as an indispensable public good accessible to all citizens on an impartial and timely basis.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is the role of the National Sample Survey Office (NSSO) Field Operations Division (FOD)?",
                "option_a": "Designing printed letterheads for the ministry",
                "option_b": "Primary collection and field canvassing of nationwide socio-economic, enterprise, and agricultural survey schedules",
                "option_c": "Printing national currency notes",
                "option_d": "Adjudicating corporate civil lawsuits",
                "correct_option": "B",
                "explanation": "FOD is the grassroots field wing of NSSO responsible for field data collection across rural and urban sampling units nationwide.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Which legal statute governs the collection, obligation of disclosure, and penalties for non-compliance in official statistics collection in India?",
                "option_a": "The Collection of Statistics Act, 2008 (amended in 2017)",
                "option_b": "The Indian Penal Code Section 144",
                "option_c": "The Companies Act 1956",
                "option_d": "The Information Technology Act 2000",
                "correct_option": "A",
                "explanation": "The Collection of Statistics Act 2008 facilitates the collection of statistical data from individuals, households, and business units with statutory confidentiality safeguards.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What is an Advance Release Calendar (ARC) in official economic statistics release governance?",
                "option_a": "A wall calendar distributed to employees in January",
                "option_b": "A publicly announced schedule specifying in advance the exact dates and times of data releases (like GDP, CPI, IIP) to maintain transparency and market neutrality",
                "option_c": "A list of government holidays",
                "option_d": "A training schedule for civil servants",
                "correct_option": "B",
                "explanation": "The ARC guarantees transparent, predictable releases without political delay, in compliance with IMF Special Data Dissemination Standards (SDDS).",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is the primary role of the Indian Statistical Service (ISS)?",
                "option_a": "Conducting judicial trials in district courts",
                "option_b": "Providing professional statistical leadership, survey design, macroeconomic compilation, and analytical expertise across Government of India ministries",
                "option_c": "Managing immigration at international airports",
                "option_d": "Patrolling coastal maritime boundaries",
                "correct_option": "B",
                "explanation": "The ISS is the organized Group 'A' central civil service that mans statistical positions across central ministries, MoSPI, and statistical agencies.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "Under the IMF Special Data Dissemination Standard (SDDS) to which India subscribes, what four dimensions of data dissemination are monitored?",
                "option_a": "Length, Width, Height, and Weight",
                "option_b": "Data Coverage/Periodicity/Timeliness, Access by the Public, Integrity, and Quality",
                "option_c": "Printing cost, Binding quality, Font size, and Paper color",
                "option_d": "Software licensing, Hardware warranty, RAM, and Storage",
                "correct_option": "B",
                "explanation": "SDDS monitors real, fiscal, financial, and external sector data coverage, public equal access, statistical integrity, and verifiable quality.",
                "bloom_level": "UNDERSTAND"
            },
            {
                "question_text": "What is the function of the National Academy of Statistical Administration (NSSTA) located in Greater Noida?",
                "option_a": "Printing textbooks for primary schools",
                "option_b": "Serving as the premier capacity building and training institute for official statisticians from India and developing nations",
                "option_c": "Manufacturing weighing scales for retail shops",
                "option_d": "Issuing driving licenses for transport vehicles",
                "correct_option": "B",
                "explanation": "NSSTA is the apex training academy under MoSPI conducting induction and in-service training for ISS officers and international statistical personnel.",
                "bloom_level": "REMEMBER"
            },
            {
                "question_text": "What constitutes 'Professional Independence' in the production of official statistics?",
                "option_a": "Statisticians working from home without supervision",
                "option_b": "Statistical authorities developing, producing, and disseminating statistics based strictly on professional and scientific considerations free from political interference",
                "option_c": "Refusing to report findings to the public",
                "option_d": "Hiring only international consultants",
                "correct_option": "B",
                "explanation": "Professional independence guarantees that statistical methodologies, release contents, and timings are determined objectively without external political influence.",
                "bloom_level": "UNDERSTAND"
            }
        ]
    }
]

async def seed_official_quizzes(db: AsyncSession):
    """
    Seeds 8 official published quizzes with 10 authentic MCQs each.
    Safe to run repeatedly — checks if already seeded.
    """
    result = await db.execute(select(Quiz))
    existing_quizzes = result.scalars().all()
    
    # Check for existing system doc and user
    user_res = await db.execute(select(User).limit(1))
    user = user_res.scalar_one_or_none()
    creator_id = user.id if user else 1

    doc_res = await db.execute(select(Document).limit(1))
    doc = doc_res.scalar_one_or_none()
    
    if not doc:
        # Create a placeholder official curriculum document
        doc = Document(
            user_id=creator_id,
            filename="official_mospi_curriculum_2025.pdf",
            original_name="Official MoSPI Competency Curriculum 2025.pdf",
            file_type="application/pdf",
            file_size=1048576,
            file_path="official_mospi_curriculum_2025.pdf",
            processing_status="READY"
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)

    document_id = doc.id

    existing_titles = {q.title for q in existing_quizzes}
    
    for q_data in OFFICIAL_QUIZZES:
        if q_data["title"] in existing_titles:
            continue

        quiz = Quiz(
            document_id=document_id,
            creator_id=creator_id,
            title=q_data["title"],
            description=q_data["description"],
            total_questions=len(q_data["questions"]),
            difficulty_level=q_data["difficulty_level"],
            status="PUBLISHED",
            target_role=q_data["target_role"]
        )
        db.add(quiz)
        await db.commit()
        await db.refresh(quiz)

        for q_item in q_data["questions"]:
            mcq = MCQQuestion(
                quiz_id=quiz.id,
                document_chunk_id=None,
                question_text=q_item["question_text"],
                option_a=q_item["option_a"],
                option_b=q_item["option_b"],
                option_c=q_item["option_c"],
                option_d=q_item["option_d"],
                correct_option=q_item["correct_option"],
                explanation=q_item["explanation"],
                bloom_level=q_item["bloom_level"]
            )
            db.add(mcq)

        await db.commit()

    # Ensure all quizzes in db have status PUBLISHED
    all_q_res = await db.execute(select(Quiz))
    for q in all_q_res.scalars().all():
        if q.status != "PUBLISHED":
            q.status = "PUBLISHED"
    await db.commit()
