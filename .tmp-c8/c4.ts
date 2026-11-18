// =====================================================================================
// Chapter 10 — Landlords and Tenants under the British and the Nizam
// =====================================================================================
const c10Events: EV[] = [
  [1765, 'East India Company gets the Diwani (revenue rights) of Bengal', '1765'],
  [1793, 'Permanent Settlement introduced in Bengal by Lord Cornwallis', '1793'],
  [1820, 'Ryotwari system extended in Madras Presidency under Thomas Munro', 'about 1820'],
  [1859, 'Indigo revolt by peasants in Bengal', '1859–60'],
  [1875, 'Deccan riots against moneylenders', '1875'],
];
const ch10: USpec = {
  id: 'ts8.ss.ch10', subject: 'social', title: 'Landlords and Tenants under the British and the Nizam', source: src(10),
  objectives: [
    {
      id: 'ts8.ss.land.settlements', title: 'Permanent Settlement and the Ryotwari system', prereqs: [],
      intro: [
        h('Who should pay the land tax?'),
        photo('🌾', 'Under colonial rule, land revenue was the biggest source of income for the government.'),
        p('After 1765, the East India Company collected land revenue in Bengal. It wanted a steady, large income. Two main systems were tried in different regions.'),
        def('Permanent Settlement (Zamindari system)', 'Introduced in Bengal in 1793 by Lord Cornwallis. Zamindars were made owners of land and had to pay a fixed revenue to the Company for ever. If they failed to pay on time (by sunset of the due date), their estates were auctioned.'),
        def('Ryotwari system', 'Introduced in parts of Madras and Bombay Presidencies (developed by Alexander Read and Thomas Munro, about 1820). Revenue was settled directly with the ryot (cultivator), who was recognised as owner; the rate was revised periodically, often every 30 years.'),
        p('Under the Permanent Settlement, revenue was fixed very high; zamindars squeezed tenants with high rents and evictions, while many old zamindars lost estates in auctions. Under Ryotwari, there was no middleman, but revenue was often set too high and had to be paid in cash, even in years of drought, pushing ryots into debt.'),
        keys('1793: Permanent Settlement — zamindars, fixed revenue, Bengal.', 'Ryotwari: direct with cultivators — Madras, Bombay; revised periodically.', 'Both demanded high revenue in cash.', 'Peasants and tenants suffered in both.'),
        remember('Cornwallis → Permanent Settlement (1793); Munro → Ryotwari (Madras).'),
        tip('Zamindari has a middleman (zamindar); Ryotwari has none — revenue goes straight from ryot to government.'),
      ],
      examples: [
        ex('Who paid revenue to the government under (a) Permanent Settlement and (b) Ryotwari?', ['(a) The zamindar, who collected rent from tenants.', '(b) The ryot himself, directly.'], 'Zamindar under Permanent Settlement; ryot under Ryotwari'),
        ex('Why did the Company like the Permanent Settlement at first?', ['It guaranteed a fixed income every year.', 'Collection became the zamindar’s job.', 'The Company hoped zamindars would invest in land.'], 'Fixed, assured revenue with less effort'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of colonial land revenue in order.', c10Events, ['The Diwani came before any settlement.', 'Riots came after the systems caused hardship.']),
        mcq('mcq', 'Zamindari = middleman; Ryotwari = direct with cultivator.', [
          ['The Permanent Settlement was introduced in…', '1793', ['1857', '1820', '1947'], 'By Lord Cornwallis.', 'It was introduced in Bengal in 1793.'],
          ['Under the Ryotwari system, revenue was collected from…', 'The ryot (cultivator) directly', ['The zamindar', 'The village temple', 'Traders'], 'No middleman.', 'Ryotwari dealt directly with cultivators.'],
          ['The Ryotwari system is associated with…', 'Thomas Munro', ['Lord Cornwallis', 'Lord Curzon', 'Lord Dalhousie'], 'Governor of Madras.', 'Munro developed and extended Ryotwari in Madras.'],
          ['Under the Permanent Settlement, if a zamindar failed to pay on time…', 'His estate could be auctioned', ['He got a reward', 'Revenue was cancelled', 'Tenants paid nothing'], 'The “sunset law”.', 'Estates of defaulting zamindars were sold.'],
          ['A common problem in both systems was…', 'High revenue demanded in cash, causing debt', ['Too little revenue', 'No role for money', 'Free land for all'], 'Even in drought years.', 'Cash demands pushed peasants towards moneylenders.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Zamindar', 'Landlord who paid fixed revenue'], ['Ryot', 'Cultivator'], ['Permanent Settlement', 'Fixed revenue for ever, 1793'],
          ['Ryotwari', 'Direct settlement with cultivators'], ['Diwani', 'Right to collect revenue'], ['Tenant', 'Farmer who cultivates another’s land for rent'],
        ], ['Ryot = cultivator.', 'Diwani was granted in 1765.']),
      ],
    },
    {
      id: 'ts8.ss.land.commercial', title: 'Commercialisation of agriculture and moneylenders', prereqs: ['ts8.ss.land.settlements'],
      intro: [
        h('Growing crops for the market, not the family'),
        photo('🪙', 'Revenue had to be paid in cash, so peasants had to sell crops — or borrow.'),
        def('Commercialisation of agriculture', 'Growing crops mainly for sale in the market (cash crops) rather than for the family’s own food.'),
        p('British policies encouraged cash crops such as cotton, indigo, jute, groundnut and tobacco, which were needed by factories in Britain. Peasants needed cash to pay revenue on fixed dates. Prices of cash crops rose and fell with world markets; when they crashed, peasants could not repay loans.'),
        p('Moneylenders (sahukars) lent at very high interest, often keeping accounts the peasant could not read. Land given as security was taken over when loans were not repaid. Land slowly passed from cultivators to moneylenders and landlords. Anger broke out in revolts like the Indigo revolt (1859–60) in Bengal and the Deccan riots (1875) in Maharashtra.'),
        keys('Cash crops for the market: cotton, indigo, jute.', 'Revenue in cash → borrowing.', 'High interest → loss of land to moneylenders.', 'Revolts: Indigo (1859–60), Deccan riots (1875).'),
        remember('Debt trap: low price → loan → high interest → land lost.'),
        tip('Compound interest at high rates doubles a debt very quickly — that is why loans became traps.'),
      ],
      examples: [
        ex('A peasant borrows ₹100 at 25% simple interest per year. How much does he owe after 4 years?', ['Interest = 100 × 25 × 4 ÷ 100 = ₹100.', 'Total = 100 + 100 = ₹200.'], '₹200 — the debt has doubled'),
        ex('Why did cash-crop farmers suffer when world prices fell?', ['Their income depended on selling the crop.', 'Revenue and loan payments stayed fixed.', 'So they borrowed more and lost land.'], 'Fixed payments with falling income led to debt'),
      ],
      practice: [
        tp('debt', (r) => {
          const P = r.pick([100, 200, 500, 1000]);
          const R = r.pick([20, 25, 30, 40, 50]);
          const T = r.pick([2, 3, 4]);
          const tot = P + (P * R * T) / 100;
          return numQ(`A peasant borrowed ₹${P} from a moneylender at ${R}% simple interest per year. How much (₹) does he owe in total after ${T} years?`, tot, ['Interest = P × R × T ÷ 100.', 'Total owed = principal + interest.'], [`Interest = ${P} × ${R} × ${T} ÷ 100 = ₹${(P * R * T) / 100}`, `Total = ${P} + ${(P * R * T) / 100} = ₹${tot}`], [{ when: String((P * R * T) / 100), explain: 'That is only the interest. Add the amount borrowed.' }], 0.001);
        }, 2),
        mcq('mcq', 'Cash demands + high interest = debt trap.', [
          ['Commercialisation of agriculture means…', 'Growing crops mainly for sale', ['Growing only for the family', 'Stopping farming', 'Farming by machines only'], 'Market-oriented farming.', 'Cash crops are grown for sale.'],
          ['Which was a cash crop encouraged by the British?', 'Indigo', ['Ragi for home', 'Millets for the family', 'Kitchen herbs'], 'Used as blue dye.', 'Indigo, cotton and jute were grown for export.'],
          ['Why did peasants borrow from moneylenders?', 'To pay revenue in cash on fixed dates', ['To buy cars', 'For school fees only', 'To pay the Election Commission'], 'Revenue in cash.', 'Cash demands forced borrowing.'],
          ['The Deccan riots of 1875 were directed against…', 'Moneylenders', ['Factory owners', 'Tribal chiefs', 'Railway workers'], 'Peasants burnt account books.', 'Peasants attacked moneylenders and their bonds.'],
          ['When peasants could not repay loans…', 'Their land passed to moneylenders', ['The loans were forgiven', 'They got higher prices', 'The government paid'], 'Land was the security.', 'Mortgaged land was taken over.'],
        ]),
        orderT('order', 'Put the steps of the peasant debt trap in order.', ['Revenue must be paid in cash on a fixed date', 'Crop prices fall and income is short', 'Peasant borrows from a moneylender at high interest', 'Debt grows faster than income', 'Land pledged as security is taken over'], ['It starts with the cash demand.', 'Losing land is the last step.'], 'Cash demand → low income → loan → growing debt → land lost.'),
      ],
    },
    {
      id: 'ts8.ss.land.nizam', title: 'Zamindars, Doras and peasants in Hyderabad State', prereqs: ['ts8.ss.land.commercial'],
      intro: [
        h('Land and power in the Nizam’s dominions'),
        photo('👑', 'In Hyderabad State, land, power and status were concentrated in a few hands.'),
        p('In the Nizam’s Hyderabad State, land was held under different tenures. Roughly 60% was diwani or khalsa land, where the government collected revenue directly; roughly 30% was given as jagirs to nobles (jagirdars, paigahs, samsthans) who collected revenue for themselves; and about 10% was sarf-e-khas, the Nizam’s personal estate whose income went to the royal family (approximate shares).'),
        def('Dora / Deshmukh', 'Powerful village landlords in Telangana who held large lands and acted as revenue collectors and local rulers; peasants addressed them as “Dora” (master).'),
        def('Vetti', 'Forced, unpaid labour that lower castes and poor peasants had to perform for landlords and officials.'),
        def('Bhagela', 'A bonded labourer who worked for a landlord to repay a loan, sometimes for life.'),
        p('Doras collected high rents, took illegal levies, seized land of indebted peasants and forced people into vetti — carrying loads, working fields, serving at weddings. Dalits and tribals suffered most. This oppression later fuelled the Telangana armed struggle (1946–51).'),
        bars(['Diwani/Khalsa', 'Jagir', 'Sarf-e-khas'], [60, 30, 10], '%', 'Approximate shares of land in Hyderabad State by tenure: about 60% diwani/khalsa, 30% jagir, 10% sarf-e-khas (rounded).'),
        keys('Khalsa (~60%), jagir (~30%), sarf-e-khas (~10%) — approximate.', 'Doras/deshmukhs dominated villages.', 'Vetti = forced labour; bhagela = bonded labourer.', 'Oppression led to peasant resistance.'),
        remember('Sarf-e-khas was the Nizam’s personal estate.'),
        tip('Remember “Vetti” as “work without wage”.'),
      ],
      examples: [
        ex('Hyderabad State had about 82,000 square miles of land (rounded). If 30% was under jagirs, roughly how many square miles was that?', ['30% of 82,000 = 0.3 × 82,000.', '= 24,600 square miles.'], 'About 24,600 square miles'),
        ex('Why was vetti especially unjust?', ['People were forced to work without pay.', 'It fell mostly on Dalits and poor peasants.', 'Refusal led to punishment, so they had no freedom of choice.'], 'It was forced, unpaid and caste-based'),
      ],
      practice: [
        mcq('mcq', 'Recall the land tenures and terms of Hyderabad State.', [
          ['Sarf-e-khas land was…', 'The Nizam’s personal estate', ['Land given to temples', 'Forest land', 'Land of tenants'], 'Its income went to the royal family.', 'Sarf-e-khas revenues belonged to the Nizam.'],
          ['Vetti meant…', 'Forced unpaid labour', ['A type of crop', 'A land tax in cash', 'A festival'], 'Work without wages.', 'Vetti was compulsory free labour for landlords and officials.'],
          ['A bhagela was a…', 'Bonded labourer working to repay a debt', ['Royal minister', 'Moneylender', 'Village priest'], 'Bound to the landlord.', 'Bhagelas were bonded to landlords, often for life.'],
          ['Roughly what share of Hyderabad State land was under jagirs?', 'About 30%', ['About 90%', 'About 2%', 'About 60%'], 'Less than khalsa.', 'Jagirs covered roughly 30% of the land (approximate).'],
          ['Land where the government collected revenue directly was called…', 'Diwani or khalsa', ['Jagir', 'Sarf-e-khas', 'Inam to temples'], 'The largest share.', 'Khalsa/diwani land was under direct government revenue collection.'],
          ['The oppression by doras later led to…', 'The Telangana armed struggle (1946–51)', ['The Permanent Settlement', 'The Green Revolution', 'The Salt March'], 'A peasant movement.', 'Anger at doras fuelled the struggle of 1946–51.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Dora', 'Powerful village landlord'], ['Vetti', 'Forced unpaid labour'], ['Bhagela', 'Bonded labourer'], ['Jagir', 'Land granted to nobles'],
          ['Khalsa', 'Land under direct government revenue'], ['Sarf-e-khas', 'Nizam’s personal estate'],
        ], ['Three are types of land.', 'Vetti and bhagela are kinds of unfree labour.']),
        tp('share', (r) => {
          const tot = r.pick([80000, 82000, 82500]);
          const [name, pc] = r.pick<[string, number]>([['jagir', 30], ['khalsa (diwani)', 60], ['sarf-e-khas', 10]]);
          const ans = (tot * pc) / 100;
          return numQ(`Take Hyderabad State’s area as about ${tot.toLocaleString('en-IN')} square miles (rounded). If about ${pc}% was ${name} land, roughly how many square miles was that?`, ans, ['Find the percentage of the total.', `${pc} ÷ 100 × ${tot}`], [`${pc}% of ${tot} = ${ans.toLocaleString('en-IN')} square miles`], [], 0.005);
        }, 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11A — National Movement: The Early Phase 1885–1919
// =====================================================================================
const c11aEvents: EV[] = [
  [1876, 'Indian Association founded in Calcutta', '1876'],
  [1885, 'Indian National Congress founded at Bombay', 'December 1885'],
  [1905, 'Partition of Bengal; Swadeshi movement begins', '1905'],
  [1906, 'All India Muslim League founded at Dhaka', '1906'],
  [1907, 'Congress splits at Surat into Moderates and Extremists', '1907'],
  [1911, 'Partition of Bengal annulled', '1911'],
  [1914, 'First World War begins', '1914'],
  [1916, 'Home Rule Leagues and the Lucknow Pact', '1916'],
];
const ch11a: USpec = {
  id: 'ts8.ss.ch11a', subject: 'social', title: 'National Movement – The Early Phase 1885–1919', source: src('11A'),
  objectives: [
    {
      id: 'ts8.ss.nm1.congress', title: 'Early associations and the Moderates of the Indian National Congress', prereqs: [],
      intro: [
        h('Educated Indians begin to organise'),
        photo('📜', 'Petitions, speeches and newspapers were the early tools of Indian nationalists.'),
        p('By the second half of the 19th century, educated Indians began to discuss how British rule affected India. They formed associations: the British Indian Association (1851), the Poona Sarvajanik Sabha (1870), the Indian Association of Calcutta (1876) led by Surendranath Banerjea, and the Madras Mahajana Sabha (1884).'),
        p('In December 1885, 72 delegates met in Bombay and founded the Indian National Congress, with W. C. Bonnerjee as president. A retired British official, A. O. Hume, helped organise it.'),
        def('Moderates', 'Early Congress leaders such as Dadabhai Naoroji, Pherozeshah Mehta, Gopal Krishna Gokhale and Surendranath Banerjea, who believed in petitions, speeches and constitutional methods to win reforms.'),
        def('Drain theory', 'Dadabhai Naoroji’s argument that British rule drained India’s wealth to Britain through salaries, pensions, profits and trade.'),
        p('Moderates demanded more Indians in councils and in the civil services, lower land revenue, less military spending and protection for Indian industry. They exposed the economic effects of colonial rule and built national awareness, though they won only limited reforms.'),
        keys('Early associations: 1851, 1870, 1876, 1884.', 'INC founded December 1885, Bombay, 72 delegates.', 'Moderates: petitions and constitutional methods.', 'Naoroji’s drain theory.'),
        remember('W. C. Bonnerjee was the first president of the Congress (1885).'),
        tip('Moderates = “prayers, petitions, protests” within the law.'),
      ],
      examples: [
        ex('Name two demands of the Moderates.', ['More Indian representation in legislative councils.', 'Holding civil service examinations in India too and reducing land revenue.'], 'E.g. more Indians in councils; lower revenue'),
        ex('What did Dadabhai Naoroji mean by the “drain of wealth”?', ['India’s wealth went to Britain as salaries, pensions, interest and profits.', 'Nothing equal came back to India.', 'So India grew poorer.'], 'An unreturned outflow of Indian wealth to Britain'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of the early national movement in order.', c11aEvents, ['The Indian Association came before the Congress.', 'The Surat split came after the Swadeshi movement began.']),
        mcq('mcq', 'Moderates worked through constitutional methods.', [
          ['The Indian National Congress was founded in…', '1885', ['1857', '1905', '1920'], 'At Bombay in December.', 'The INC was founded in December 1885.'],
          ['The first president of the Congress was…', 'W. C. Bonnerjee', ['Mahatma Gandhi', 'Bal Gangadhar Tilak', 'Jawaharlal Nehru'], 'A Bengali lawyer.', 'W. C. Bonnerjee presided over the first session.'],
          ['The “drain of wealth” theory was put forward by…', 'Dadabhai Naoroji', ['Lala Lajpat Rai', 'Lord Curzon', 'Annie Besant'], 'The “Grand Old Man of India”.', 'Naoroji explained the drain of wealth.'],
          ['The Moderates mainly used…', 'Petitions, meetings and speeches', ['Armed attacks', 'Boycott and strikes only', 'Non-cooperation'], 'Constitutional methods.', 'Moderates believed in persuasion within the law.'],
          ['The Indian Association (1876) was led by…', 'Surendranath Banerjea', ['Dayanand Saraswati', 'Sir Syed Ahmad Khan', 'Bipin Chandra Pal'], 'A Calcutta leader.', 'Banerjea founded the Indian Association.'],
        ]),
        matchT('match', 'leader or body to its description', [
          ['Dadabhai Naoroji', 'Drain theory'], ['W. C. Bonnerjee', 'First Congress president'], ['A. O. Hume', 'Retired official who helped found the Congress'],
          ['G. K. Gokhale', 'Moderate leader; Gandhi’s political guru'], ['Indian Association', 'Founded 1876 in Calcutta'], ['Madras Mahajana Sabha', 'Founded 1884'],
        ], ['Two are organisations.', 'Gandhi called Gokhale his guru.']),
      ],
    },
    {
      id: 'ts8.ss.nm1.swadeshi', title: 'The Swadeshi movement; Moderates and Extremists', prereqs: ['ts8.ss.nm1.congress'],
      intro: [
        h('Bengal is divided — India protests'),
        photo('🚩', 'In 1905 people across India took the Swadeshi pledge to use Indian-made goods.'),
        p('In 1905 the Viceroy Lord Curzon partitioned Bengal, saying it was too large to govern. Indians saw it as a move to divide Hindus and Muslims and weaken the nationalist movement in Bengal. The partition came into effect on 16 October 1905, which people observed as a day of mourning.'),
        def('Swadeshi and boycott', 'Swadeshi means “of one’s own country” — using Indian-made goods. Boycott meant refusing British goods, schools, courts and titles; foreign cloth was burnt in bonfires.'),
        def('Extremists', 'Leaders such as Bal Gangadhar Tilak, Lala Lajpat Rai and Bipin Chandra Pal (“Lal–Bal–Pal”) who demanded Swaraj (self-rule) and used mass action like boycott. Tilak declared “Swaraj is my birthright and I shall have it.”'),
        p('The movement spread to Andhra: Bipin Chandra Pal’s speeches at Rajahmundry and other towns in 1907 inspired the Vande Mataram movement there. National schools, Swadeshi stores and industries started. Differences over methods split the Congress at Surat in 1907. The Muslim League was formed in 1906, and the Morley–Minto Reforms (1909) introduced separate electorates for Muslims. The partition of Bengal was annulled in 1911.'),
        keys('1905: Partition of Bengal by Curzon → Swadeshi.', 'Boycott of foreign goods; national education.', 'Lal–Bal–Pal: Extremists demanding Swaraj.', '1907 Surat split; 1909 separate electorates; 1911 partition annulled.'),
        remember('“Swaraj is my birthright and I shall have it” — Bal Gangadhar Tilak.'),
        tip('Moderates asked for reforms; Extremists demanded Swaraj through mass action.'),
      ],
      examples: [
        ex('How did the Moderates and Extremists differ in methods?', ['Moderates: petitions, appeals to British fairness, gradual reforms.', 'Extremists: self-reliance, boycott, mass participation, demand for Swaraj.'], 'Petitions vs mass action and Swaraj'),
        ex('Why did Indians oppose the partition of Bengal?', ['It divided a single Bengali-speaking people.', 'It was seen as an attempt to divide Hindus and Muslims.', 'It aimed to weaken nationalism in Bengal.'], 'They saw it as “divide and rule”'),
      ],
      practice: [
        mcq('mcq', 'Swadeshi began with the partition of Bengal.', [
          ['The partition of Bengal was announced by…', 'Lord Curzon', ['Lord Ripon', 'Lord Mountbatten', 'Lord Cornwallis'], 'Viceroy 1899–1905.', 'Curzon partitioned Bengal in 1905.'],
          ['Swadeshi means…', 'Using goods made in one’s own country', ['Using foreign goods', 'Paying taxes', 'Joining the army'], 'Swa = own; desh = country.', 'Swadeshi promoted Indian-made goods.'],
          ['“Lal–Bal–Pal” refers to…', 'Lajpat Rai, Tilak and Bipin Chandra Pal', ['Three British viceroys', 'Three rivers', 'Three Moderate leaders'], 'Extremist leaders.', 'They led the Extremist wing.'],
          ['The Congress split into Moderates and Extremists at…', 'Surat, 1907', ['Lahore, 1929', 'Lucknow, 1916', 'Bombay, 1885'], 'Two years after the partition.', 'The split happened at the Surat session in 1907.'],
          ['The partition of Bengal was cancelled in…', '1911', ['1905', '1919', '1947'], 'Announced at the Delhi Durbar.', 'It was annulled in 1911.'],
          ['Separate electorates for Muslims were introduced by…', 'The Morley–Minto Reforms of 1909', ['The Rowlatt Act', 'The Permanent Settlement', 'The Lucknow Pact'], 'Also called the Indian Councils Act 1909.', 'The 1909 reforms created separate electorates.'],
        ]),
        tapT('tap', 'Tap every method used in the Swadeshi movement.', [
          ['Boycott of British cloth', true], ['Bonfires of foreign goods', true], ['Setting up national schools', true], ['Opening Swadeshi stores and industries', true],
          ['Joining the British army in large numbers', false], ['Buying more Manchester cloth', false], ['Accepting British titles eagerly', false],
        ], ['Swadeshi = Indian goods; boycott = refuse British.', 'Buying Manchester cloth helped British mills.'], 'Swadeshi combined boycott with building Indian institutions.'),
        matchT('match', 'leader or event to its description', [
          ['Bal Gangadhar Tilak', '“Swaraj is my birthright”'], ['Lord Curzon', 'Partitioned Bengal, 1905'], ['Bipin Chandra Pal', 'Speeches in Andhra, 1907'],
          ['Surat, 1907', 'Congress split'], ['1906', 'Muslim League founded'], ['1911', 'Partition annulled'],
        ], ['Pal toured Rajahmundry.', 'Tilak is linked with Swaraj.']),
      ],
    },
    {
      id: 'ts8.ss.nm1.ww1', title: 'The First World War and its impact on India', prereqs: ['ts8.ss.nm1.swadeshi'],
      intro: [
        h('A war far away changes India'),
        photo('🗡️', 'More than a million Indian soldiers served overseas in the First World War (1914–18).'),
        p('When the First World War broke out in 1914, Britain drew India into it. More than a million Indian soldiers served in Europe, West Asia and Africa, and tens of thousands died. India contributed money, food and materials.'),
        p('At home, taxes and prices rose sharply, there were forced recruitments in some villages, and shortages hurt the poor. Yet Indian industries such as textiles and steel grew because imports fell. Nationalists expected Britain to reward India’s help with self-government.'),
        def('Home Rule Movement', 'Started in 1916 by Bal Gangadhar Tilak (April) and Annie Besant (September), demanding self-government within the British Empire, like Australia and Canada.'),
        def('Lucknow Pact (1916)', 'An agreement between the Congress and the Muslim League to make joint demands for self-government; the Moderates and Extremists also reunited that year.'),
        p('In 1917 the British Secretary of State Montagu announced that the goal was “responsible government” in India, gradually. Mahatma Gandhi returned from South Africa in January 1915 and began local struggles in Champaran (1917) and Kheda (1918). By 1919 Indians were impatient — the stage was set for mass movements.'),
        keys('Over a million Indians served in WWI.', 'Prices and taxes rose; industries grew.', 'Home Rule Leagues 1916 (Tilak, Besant).', 'Lucknow Pact 1916; Montagu Declaration 1917.'),
        remember('Annie Besant, an Irish woman, led a Home Rule League from Madras.'),
        tip('War impacts: economic (prices, taxes), political (Home Rule, unity), social (soldiers’ new experiences).'),
      ],
      examples: [
        ex('Give two economic effects of the First World War on India.', ['Prices of essential goods rose sharply.', 'Taxes and war loans increased.', 'Indian industries grew as imports fell.'], 'Rising prices and taxes; growth of Indian industry'),
        ex('Why was the Lucknow Pact important?', ['The Congress and the Muslim League made joint demands.', 'Moderates and Extremists also came together.', 'It showed national unity against British rule.'], 'It united the Congress and the League in joint demands'),
      ],
      practice: [
        mcq('mcq', 'The war years: 1914–18.', [
          ['The Home Rule Leagues were started in 1916 by…', 'Tilak and Annie Besant', ['Gandhi and Nehru', 'Curzon and Minto', 'Naoroji and Hume'], 'One Indian, one Irish.', 'Tilak and Besant led the two Home Rule Leagues.'],
          ['The Lucknow Pact (1916) was between…', 'The Congress and the Muslim League', ['Britain and Germany', 'Two princely states', 'The Nizam and the British'], 'Joint demands.', 'The Congress and League agreed on joint demands.'],
          ['An economic effect of WWI on India was…', 'A sharp rise in prices', ['Fall in taxes', 'End of all industry', 'Free food for all'], 'War costs money.', 'Wartime demand and shortages raised prices.'],
          ['Gandhi returned to India from South Africa in…', '1915', ['1885', '1905', '1930'], 'During the war.', 'Gandhi returned in January 1915.'],
          ['The First World War lasted from…', '1914 to 1918', ['1939 to 1945', '1905 to 1911', '1857 to 1858'], 'Four years.', 'WWI was fought from 1914 to 1918.'],
        ]),
        timelineT('tl', 'Arrange these events in order.', [
          [1905, 'Partition of Bengal', '1905'], [1914, 'First World War begins', '1914'], [1915, 'Gandhi returns to India', '1915'],
          [1916, 'Home Rule Leagues and Lucknow Pact', '1916'], [1917, 'Champaran Satyagraha', '1917'], [1918, 'First World War ends', '1918'],
        ], ['Bengal came before the war.', 'Champaran came the year after the Lucknow Pact.']),
        tapT('tap', 'Tap every effect of the First World War on India.', [
          ['Rise in prices of essential goods', true], ['Higher taxes and war loans', true], ['Growth of some Indian industries', true], ['Demand for Home Rule', true],
          ['Immediate independence for India', false], ['Fall in prices of food', false], ['End of British rule in 1918', false],
        ], ['Independence came only in 1947.', 'War made goods scarcer.'], 'The war raised prices and taxes, helped some industries and strengthened demands for self-rule.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11B — National Movement: The Last Phase 1919–1947
// =====================================================================================
const c11bEvents: EV[] = [
  [1917, 'Champaran Satyagraha', '1917'],
  [1919.03, 'Rowlatt Act passed', 'March 1919'],
  [1919.04, 'Jallianwala Bagh massacre at Amritsar', '13 April 1919'],
  [1920, 'Non-Cooperation and Khilafat movements launched', '1920'],
  [1922, 'Chauri Chaura incident; Non-Cooperation withdrawn', 'February 1922'],
  [1928, 'Simon Commission boycotted', '1928'],
  [1929, 'Lahore Congress demands Purna Swaraj', 'December 1929'],
  [1930, 'Dandi March (Salt Satyagraha)', 'March–April 1930'],
  [1942, 'Quit India Movement', 'August 1942'],
  [1943, 'Subhas Chandra Bose leads the INA; Azad Hind government', '1943'],
  [1946, 'Royal Indian Navy mutiny; Cabinet Mission', '1946'],
  [1947, 'Independence and Partition', '15 August 1947'],
];
const ch11b: USpec = {
  id: 'ts8.ss.ch11b', subject: 'social', title: 'National Movement – The Last Phase 1919–1947', source: src('11B'),
  objectives: [
    {
      id: 'ts8.ss.nm2.gandhi', title: 'Gandhi, the Rowlatt Act, Jallianwala Bagh, Khilafat and Non-Cooperation (1919–1929)', prereqs: ['ts8.ss.nm1.ww1'],
      intro: [
        h('A new kind of leader'),
        photo('🙏', 'Gandhi’s satyagraha — non-violent resistance based on truth — drew millions of ordinary people into the freedom struggle.'),
        def('Satyagraha', 'Gandhi’s method of non-violent resistance: opposing injustice through truth, peaceful protest and willingness to suffer, without hatred.'),
        stepsB(
          '1917–18: Gandhi leads satyagrahas for indigo farmers in Champaran, peasants in Kheda and mill workers in Ahmedabad.',
          'March 1919: the Rowlatt Act allows imprisonment without trial; Gandhi calls a nationwide hartal.',
          '13 April 1919: General Dyer’s troops fire on a peaceful crowd at Jallianwala Bagh, Amritsar; hundreds are killed.',
          '1920: the Khilafat movement (for the Caliph of Turkey) joins hands with the Non-Cooperation Movement — boycott of schools, courts, councils, foreign cloth and titles.',
          'February 1922: a crowd burns a police station at Chauri Chaura; Gandhi withdraws the movement because it turned violent.',
          '1923–29: Swaraj Party enters councils; Simon Commission (1928) boycotted with “Simon Go Back”; Lahore Congress (December 1929) declares Purna Swaraj (complete independence) as the goal.',
        ),
        p('In Andhra, Alluri Sitarama Raju led the Rampa rebellion (1922–24) of tribal people against forest laws and exploitation. In many places, peasants, students, women and workers joined the movement for the first time.'),
        keys('Rowlatt Act and Jallianwala Bagh (1919) angered the nation.', 'Non-Cooperation + Khilafat (1920) — first mass movement.', 'Chauri Chaura (1922) → movement withdrawn.', 'Lahore 1929: Purna Swaraj; 26 January 1930 celebrated as Independence Day.'),
        remember('26 January was chosen as Republic Day in 1950 to honour the Purna Swaraj pledge of 26 January 1930.'),
        tip('Non-cooperation = withdraw cooperation from the British government (schools, courts, councils, goods, titles).'),
      ],
      examples: [
        ex('Why did Gandhi withdraw the Non-Cooperation Movement in 1922?', ['At Chauri Chaura a crowd set fire to a police station, killing policemen.', 'Gandhi believed the movement must be strictly non-violent.', 'He felt people were not yet ready, so he stopped it.'], 'Because of the violence at Chauri Chaura'),
        ex('Why did the Rowlatt Act anger Indians?', ['It allowed people to be arrested and jailed without trial.', 'This came right after Indians had helped Britain in the war.', 'It was seen as a “black act” against civil liberties.'], 'It allowed imprisonment without trial'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of 1917–1929 in time order.', c11bEvents.slice(0, 7), ['Champaran came first.', 'The massacre followed the Act by about a month.']),
        mcq('mcq', 'Key events 1919–1929.', [
          ['The Jallianwala Bagh massacre took place on…', '13 April 1919', ['15 August 1947', '26 January 1930', '9 August 1942'], 'Baisakhi day in Amritsar.', 'General Dyer ordered firing on 13 April 1919.'],
          ['The Rowlatt Act allowed the government to…', 'Imprison people without trial', ['Give voting rights to all', 'Abolish land revenue', 'Free all prisoners'], 'Called a “black act”.', 'It permitted detention without trial.'],
          ['The Non-Cooperation Movement was withdrawn after…', 'Chauri Chaura (1922)', ['Dandi March', 'Quit India', 'Simon Commission'], 'Violence broke out.', 'Gandhi withdrew it after the Chauri Chaura violence.'],
          ['“Purna Swaraj” was declared the goal at the…', 'Lahore Congress, 1929', ['Surat Congress, 1907', 'Bombay Congress, 1885', 'Lucknow Congress, 1916'], 'On the bank of the Ravi.', 'The Lahore session under Nehru adopted complete independence.'],
          ['The Simon Commission was boycotted because…', 'It had no Indian member', ['It was too large', 'It was led by Gandhi', 'It gave independence'], '“Simon Go Back”.', 'An all-British commission to decide India’s future was unacceptable.'],
          ['The Rampa rebellion in Andhra (1922–24) was led by…', 'Alluri Sitarama Raju', ['Komaram Bheem', 'Tanguturi Prakasam', 'Potti Sriramulu'], 'A tribal uprising.', 'Alluri Sitarama Raju led the Rampa rebellion.'],
        ]),
        matchT('match', 'event to its description', [
          ['Champaran, 1917', 'Satyagraha for indigo farmers'], ['Rowlatt Act, 1919', 'Arrest without trial'], ['Jallianwala Bagh', 'Firing by General Dyer'],
          ['Khilafat', 'Support for the Caliph of Turkey'], ['Chauri Chaura', 'Violence that ended Non-Cooperation'], ['Lahore, 1929', 'Purna Swaraj resolution'],
        ], ['Start with places you know.', 'Khilafat is linked to Turkey.']),
      ],
    },
    {
      id: 'ts8.ss.nm2.mass', title: 'Civil Disobedience (Salt Satyagraha) and Quit India', prereqs: ['ts8.ss.nm2.gandhi'],
      intro: [
        h('A handful of salt shakes an empire'),
        photo('🌅', 'Salt was used by every family — so a tax on it touched everyone.'),
        p('Salt is needed by every person, rich or poor, and the British held a monopoly over making it and taxed it. Gandhi chose salt as a symbol. On 12 March 1930 he set out from Sabarmati Ashram with 78 followers and walked about 385 km (240 miles) in 24 days to Dandi on the Gujarat coast. On 6 April 1930 he picked up natural salt, breaking the Salt Law.'),
        def('Civil Disobedience', 'Deliberately and peacefully breaking unjust laws and accepting the punishment, to force the government to change.'),
        p('Across India people made salt, boycotted foreign cloth and liquor shops, and refused to pay taxes. Women took part in huge numbers. Over 90,000 people were arrested. The Gandhi–Irwin Pact (1931) and the Round Table Conferences in London (1930–32) followed.'),
        def('Quit India Movement', 'Launched on 8 August 1942 at Bombay, demanding that the British leave India immediately. Gandhi gave the call “Do or Die”. Leaders were arrested at once, but people continued with strikes, protests and underground activity.'),
        keys('Dandi March: 12 March–6 April 1930, about 385 km.', 'Civil Disobedience: breaking unjust laws non-violently.', 'Quit India: 8 August 1942, “Do or Die”.', 'Mass participation of women, peasants, students.'),
        remember('9 August is observed as August Kranti Day, marking the start of Quit India.'),
        tip('Speed check: 385 km ÷ 24 days ≈ 16 km a day — at the age of 60!'),
      ],
      examples: [
        ex('Gandhi walked about 385 km in 24 days. What was his average distance per day?', ['Average = distance ÷ days.', '385 ÷ 24 ≈ 16 km per day.'], 'About 16 km per day'),
        ex('Why was salt a clever symbol for a national movement?', ['Every person uses salt, so the tax hurt everyone, especially the poor.', 'Making salt was simple and anyone could break the law.', 'It united people across regions, classes and religions.'], 'It touched everyone and anyone could join'),
      ],
      practice: [
        tp('rate', (r) => {
          const [d, days] = r.pick<[number, number]>([[385, 24], [240, 24], [390, 24], [360, 24], [384, 24]]);
          const isMiles = d === 240;
          return numQ(`The Dandi March covered about ${d} ${isMiles ? 'miles' : 'km'} in ${days} days. What was the average distance walked per day (${isMiles ? 'miles' : 'km'})? Round to 1 decimal place.`, Math.round((d / days) * 10) / 10, ['Average per day = total distance ÷ number of days.', `${d} ÷ ${days}`], [`${d} ÷ ${days} = ${Math.round((d / days) * 10) / 10}`], [], 0.01);
        }, 1),
        mcq('mcq', 'Salt Satyagraha 1930; Quit India 1942.', [
          ['The Dandi March began on…', '12 March 1930', ['8 August 1942', '13 April 1919', '15 August 1947'], 'From Sabarmati Ashram.', 'Gandhi set out on 12 March 1930.'],
          ['“Do or Die” was the call given during the…', 'Quit India Movement', ['Non-Cooperation Movement', 'Swadeshi Movement', 'Khilafat Movement'], '1942.', 'Gandhi gave this call on 8 August 1942.'],
          ['Civil Disobedience means…', 'Peacefully breaking unjust laws', ['Violent revolt', 'Obeying all laws', 'Leaving the country'], 'Disobey — but civilly.', 'People broke unjust laws non-violently and accepted punishment.'],
          ['Why did Gandhi choose salt?', 'Everyone used it and the tax hurt the poor', ['Salt was a luxury', 'Only the rich used salt', 'Salt was untaxed'], 'A universal need.', 'The salt tax affected every household.'],
          ['The Quit India Movement was launched in…', '1942', ['1930', '1920', '1947'], 'During the Second World War.', 'It began on 8 August 1942.'],
          ['Which pact followed the Civil Disobedience Movement in 1931?', 'Gandhi–Irwin Pact', ['Lucknow Pact', 'Poona Pact', 'Standstill Agreement'], 'Named after the Viceroy.', 'Gandhi and Viceroy Irwin signed a pact in 1931.'],
        ]),
        tapT('tap', 'Tap every action that was part of the Civil Disobedience Movement.', [
          ['Making salt from sea water', true], ['Picketing liquor and foreign-cloth shops', true], ['Refusing to pay certain taxes', true], ['Women leading protests', true],
          ['Burning a police station at Chauri Chaura', false], ['Joining the Simon Commission', false], ['Signing the Lucknow Pact', false],
        ], ['Civil Disobedience began in 1930.', 'Chauri Chaura was 1922.'], 'Salt-making, picketing and tax refusal were non-violent acts of civil disobedience.'),
      ],
    },
    {
      id: 'ts8.ss.nm2.independence', title: 'Subhas Chandra Bose and the INA; independence and partition', prereqs: ['ts8.ss.nm2.mass'],
      intro: [
        h('The final years'),
        photo('🚩', 'On 15 August 1947 the tricolour was raised as India became independent.'),
        p('Subhas Chandra Bose was elected Congress president in 1938 and 1939 but differed with Gandhi and formed the Forward Bloc. During the Second World War he escaped from India (1941) and in 1943 took charge of the Indian National Army (INA) in Southeast Asia, formed from Indian soldiers taken prisoner by Japan and Indians living there. He set up the Azad Hind government in Singapore in October 1943 and gave the slogans “Delhi Chalo” and “Give me blood and I will give you freedom.” The INA had a women’s regiment named after Rani Lakshmibai.'),
        p('The INA could not win militarily, but the trials of INA officers at the Red Fort (1945–46) stirred the whole country. In February 1946 sailors of the Royal Indian Navy revolted in Bombay. Britain, weakened by war, sent the Cabinet Mission (1946). The Muslim League demanded a separate Pakistan; communal violence spread, beginning with Direct Action Day (16 August 1946).'),
        def('Partition', 'The division of British India into India and Pakistan in August 1947, based on the Mountbatten Plan of 3 June 1947.'),
        p('India became independent on 15 August 1947. Partition was accompanied by terrible violence: an estimated 10–15 million people were displaced and several hundred thousand (some estimates up to a million) were killed. Gandhi worked for peace in Noakhali and Calcutta; he was assassinated on 30 January 1948.'),
        keys('Bose: Forward Bloc (1939), INA and Azad Hind government (1943).', 'INA trials and RIN mutiny (1945–46) shook British rule.', 'Mountbatten Plan 3 June 1947 → Partition.', '15 August 1947: independence, with great human suffering.'),
        remember('“Jai Hind” became a popular greeting through the INA.'),
        tip('Remember the joy and the tragedy of 1947 together — independence and partition.'),
      ],
      examples: [
        ex('Why did the INA trials of 1945–46 matter, even though the INA lost militarily?', ['People across religions and regions supported the accused officers.', 'It showed that the loyalty of Indian soldiers to the British could no longer be counted on.', 'This pushed Britain to leave sooner.'], 'They united public opinion and shook British confidence in the army'),
        ex('Arrange: Quit India, Azad Hind government, Mountbatten Plan, RIN mutiny.', ['Quit India — 1942.', 'Azad Hind government — 1943.', 'RIN mutiny — February 1946.', 'Mountbatten Plan — 3 June 1947.'], '1942 → 1943 → 1946 → 1947'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of 1929–1947 in time order.', c11bEvents.slice(6), ['Purna Swaraj came first.', 'Independence came last.'], 4, 2),
        mcq('mcq', 'Bose, the INA and the road to 1947.', [
          ['The Azad Hind government was proclaimed by Bose in…', 'Singapore, 1943', ['Delhi, 1947', 'Lahore, 1929', 'London, 1931'], 'In Southeast Asia during WWII.', 'Bose proclaimed it in Singapore in October 1943.'],
          ['“Delhi Chalo” was the slogan of…', 'Subhas Chandra Bose and the INA', ['Bal Gangadhar Tilak', 'Dadabhai Naoroji', 'Lord Mountbatten'], 'March to Delhi.', 'Bose urged the INA to march to Delhi.'],
          ['The women’s regiment of the INA was named after…', 'Rani Lakshmibai', ['Sarojini Naidu', 'Annie Besant', 'Kasturba Gandhi'], 'The Rani of Jhansi.', 'It was the Rani of Jhansi Regiment.'],
          ['The plan that divided British India was announced on…', '3 June 1947', ['15 August 1947', '26 January 1950', '8 August 1942'], 'Named after the last Viceroy.', 'The Mountbatten Plan was announced on 3 June 1947.'],
          ['Bose formed the Forward Bloc in…', '1939', ['1919', '1947', '1885'], 'After resigning as Congress president.', 'He formed the Forward Bloc in 1939.'],
          ['Gandhi was assassinated on…', '30 January 1948', ['15 August 1947', '2 October 1948', '26 January 1950'], 'Observed as Martyrs’ Day.', 'Gandhi was killed on 30 January 1948.'],
        ]),
        matchT('match', 'person or event to its description', [
          ['Subhas Chandra Bose', 'Led the INA'], ['INA trials', 'Held at the Red Fort, 1945–46'], ['RIN mutiny', 'Revolt of naval ratings, Bombay 1946'],
          ['Mountbatten Plan', 'Partition plan, 3 June 1947'], ['Direct Action Day', '16 August 1946'], ['15 August 1947', 'Independence Day'],
        ], ['Two are military events.', 'Partition plan came before independence.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 12 — Freedom Movement in Hyderabad State
// =====================================================================================
const c12Events: EV[] = [
  [1724, 'Asaf Jahi (Nizam) dynasty established in Hyderabad', '1724'],
  [1857, 'Attack on the British Residency at Hyderabad led by Turrebaz Khan', 'July 1857'],
  [1901, 'Sri Krishnadevaraya Andhra Bhasha Nilayam library founded in Hyderabad', '1901'],
  [1911, 'Mir Osman Ali Khan becomes the last Nizam', '1911'],
  [1921, 'Andhra Jana Sangham formed', '1921'],
  [1930, 'First Andhra Maha Sabha conference at Jogipet', '1930'],
  [1938, 'Hyderabad State Congress formed and banned; satyagraha', '1938'],
  [1946, 'Telangana armed struggle begins', '1946'],
  [1948, 'Police Action; Hyderabad joins India', 'September 1948'],
  [1951, 'Armed struggle withdrawn', '1951'],
];
const ch12: USpec = {
  id: 'ts8.ss.ch12', subject: 'social', title: 'Freedom Movement in Hyderabad State', source: src(12),
  objectives: [
    {
      id: 'ts8.ss.hyd.early', title: 'Early nationalism, the feudal system, language, religion and the last Nizam', prereqs: ['ts8.ss.land.nizam'],
      intro: [
        h('A princely state under the Nizams'),
        photo('👑', 'Hyderabad was the largest princely state in India, ruled by the Asaf Jahi Nizams from 1724 to 1948.'),
        p('Hyderabad State included today’s Telangana and parts of Maharashtra (Marathwada) and Karnataka. It was a princely state: the Nizam ruled internally but accepted British supremacy (through the Subsidiary Alliance of 1798). In 1857, Turrebaz Khan led an attack on the British Residency in Hyderabad — an early sign of resistance.'),
        p('The state was feudal: jagirdars, deshmukhs and doras held power over villages. Most people spoke Telugu, Marathi or Kannada, but Urdu was the language of administration and of Osmania University (founded 1918). The ruler and most nobles were Muslim, while most of the population was Hindu; the large majority of people of all religions were poor peasants. There were few civil liberties — meetings, newspapers and associations needed permission and were often banned.'),
        def('Princely state', 'A state ruled by an Indian king (raja or nawab) under British supremacy, not directly by the British.'),
        p('Mir Osman Ali Khan, the seventh and last Nizam, ruled from 1911 to 1948. His reign saw the building of Osmania University, the High Court, Osmania Hospital and the Osman Sagar and Himayat Sagar reservoirs; but political rights were denied, and he wanted to remain independent of India in 1947.'),
        keys('Asaf Jahi dynasty: 1724–1948.', 'Feudal land system: jagirdars, deshmukhs, doras.', 'Urdu as official language; most people spoke Telugu, Marathi or Kannada.', 'Last Nizam: Mir Osman Ali Khan (1911–1948).'),
        remember('Osmania University, founded in 1918, taught in Urdu.'),
        tip('A balanced answer mentions both the Nizam’s modern public works and the lack of democratic rights.'),
      ],
      examples: [
        ex('Why did language become a political issue in Hyderabad State?', ['Most people spoke Telugu, Marathi or Kannada.', 'Administration and higher education used Urdu.', 'People wanted to use and develop their own languages, so language movements began.'], 'People’s languages were not used in administration and education'),
        ex('Give two achievements and one limitation of Mir Osman Ali Khan’s rule.', ['Achievements: Osmania University (1918); reservoirs like Osman Sagar; hospitals and High Court.', 'Limitation: denial of civil liberties and democratic rights.'], 'Public works vs lack of democracy'),
      ],
      practice: [
        mcq('mcq', 'Recall the nature of the Nizam’s rule.', [
          ['The Asaf Jahi dynasty ruled Hyderabad from…', '1724 to 1948', ['1857 to 1947', '1600 to 1700', '1947 to 1956'], 'Founded by Nizam-ul-Mulk.', 'The Asaf Jahis ruled from 1724 until 1948.'],
          ['The last Nizam of Hyderabad was…', 'Mir Osman Ali Khan', ['Nizam-ul-Mulk', 'Tipu Sultan', 'Salar Jung I'], 'Ruled 1911–1948.', 'Mir Osman Ali Khan was the seventh and last Nizam.'],
          ['Osmania University, founded in 1918, taught in…', 'Urdu', ['Telugu only', 'Sanskrit', 'French'], 'The official language of the state.', 'It was a pioneering Urdu-medium university.'],
          ['In 1857 the British Residency in Hyderabad was attacked under the leadership of…', 'Turrebaz Khan', ['Komaram Bheem', 'Suravaram Pratapa Reddy', 'Swami Ramananda Tirtha'], 'A Rohilla leader.', 'Turrebaz Khan led the attack in July 1857.'],
          ['A princely state was…', 'Ruled by an Indian ruler under British supremacy', ['Ruled directly by the British Parliament', 'A colony of France', 'A state with an elected government'], 'Indirect rule.', 'Princely rulers had internal control but accepted British paramountcy.'],
        ]),
        timelineT('tl', 'Arrange these events in Hyderabad’s history in order.', c12Events, ['The dynasty began in the 18th century.', 'The armed struggle came after the State Congress.']),
        tapT('tap', 'Tap every feature of Hyderabad State before 1948.', [
          ['Urdu as the official language', true], ['Powerful jagirdars and deshmukhs', true], ['Restrictions on meetings and newspapers', true], ['A ruler under British supremacy', true],
          ['Elected state government by universal vote', false], ['Telugu as the sole language of administration', false], ['Directly ruled by the British Parliament', false],
        ], ['Think feudal and princely.', 'There was no universal adult franchise.'], 'Hyderabad was a feudal princely state with Urdu administration and limited liberties.'),
      ],
    },
    {
      id: 'ts8.ss.hyd.orgs', title: 'Andhra Jana Sangham, the library movement, Andhra Maha Sabha and the State Congress', prereqs: ['ts8.ss.hyd.early'],
      intro: [
        h('Libraries, language and political awakening'),
        photo('📚', 'Libraries and reading rooms were the first centres of awakening in Telangana.'),
        p('Since political meetings were restricted, Telugu people first organised around language and culture. The Sri Krishnadevaraya Andhra Bhasha Nilayam was founded in Hyderabad in 1901, followed by the Rajaraja Narendra Andhra Bhasha Nilayam at Hanamkonda (1904) and many village libraries. These became places to read newspapers, discuss ideas and meet.'),
        def('Andhra Jana Sangham (1921)', 'Formed after a Telugu speaker was jeered at a social conference in Hyderabad for speaking in Telugu. Leaders such as Madapati Hanumantha Rao promoted Telugu language, libraries, schools and the people’s grievances.'),
        def('Andhra Maha Sabha (1930)', 'Grew out of the Jana Sangham; its first conference was held at Jogipet in 1930 under Suravaram Pratapa Reddy. Over time it took up peasant issues — vetti, illegal levies and land — and later became the main platform of the peasant movement.'),
        def('Hyderabad State Congress (1938)', 'Formed to demand responsible government; banned immediately, it launched satyagraha. Swami Ramananda Tirtha was a leading figure.'),
        p('Women’s organisations, Arya Samaj and student groups (such as the Vande Mataram protests at Osmania University in 1938) also spread awareness. Golconda Patrika (1926), edited by Suravaram Pratapa Reddy, and other journals gave voice to the people.'),
        keys('Libraries from 1901: first centres of awakening.', 'Andhra Jana Sangham 1921 — Madapati Hanumantha Rao.', 'Andhra Maha Sabha 1930, Jogipet — Suravaram Pratapa Reddy.', 'State Congress 1938 — Swami Ramananda Tirtha.'),
        remember('Madapati Hanumantha Rao is remembered as “Andhra Pitamaha” for his role in Telangana’s awakening.'),
        tip('Sequence: library → Jana Sangham → Maha Sabha → State Congress — from culture to politics.'),
      ],
      examples: [
        ex('Why did the awakening in Telangana begin with libraries and language societies?', ['Political meetings were restricted by the Nizam’s government.', 'Libraries and language societies were allowed more easily.', 'They became places to share news and ideas, preparing people for politics.'], 'Because political activity was restricted, culture became the first platform'),
        ex('Arrange: State Congress, Andhra Maha Sabha, Andhra Jana Sangham, Krishnadevaraya Bhasha Nilayam.', ['Bhasha Nilayam — 1901.', 'Jana Sangham — 1921.', 'Maha Sabha — 1930.', 'State Congress — 1938.'], '1901 → 1921 → 1930 → 1938'),
      ],
      practice: [
        timelineT('tl', 'Arrange these organisations in the order they were formed.', [
          [1901, 'Sri Krishnadevaraya Andhra Bhasha Nilayam', '1901'], [1904, 'Rajaraja Narendra Andhra Bhasha Nilayam, Hanamkonda', '1904'], [1921, 'Andhra Jana Sangham', '1921'],
          [1926, 'Golconda Patrika started', '1926'], [1930, 'Andhra Maha Sabha (Jogipet conference)', '1930'], [1938, 'Hyderabad State Congress', '1938'],
        ], ['Libraries came first.', 'The State Congress came last.']),
        mcq('mcq', 'Link each organisation with its leader and year.', [
          ['The first conference of the Andhra Maha Sabha was held at…', 'Jogipet (1930)', ['Bombay (1885)', 'Surat (1907)', 'Warangal (1948)'], 'In Medak district.', 'It met at Jogipet in 1930 under Suravaram Pratapa Reddy.'],
          ['Who is called “Andhra Pitamaha”?', 'Madapati Hanumantha Rao', ['Suravaram Pratapa Reddy', 'Swami Ramananda Tirtha', 'Burgula Ramakrishna Rao'], 'A leader of the Andhra Jana Sangham.', 'Madapati Hanumantha Rao earned this title.'],
          ['The Hyderabad State Congress was formed in…', '1938', ['1921', '1901', '1948'], 'It was banned at once.', 'It was formed in 1938 and launched satyagraha.'],
          ['Golconda Patrika was edited by…', 'Suravaram Pratapa Reddy', ['Bal Gangadhar Tilak', 'Swami Ramananda Tirtha', 'Kandukuri Veeresalingam'], 'Also presided over Jogipet.', 'Suravaram Pratapa Reddy edited Golconda Patrika.'],
          ['The first Telugu library in Hyderabad (1901) was…', 'Sri Krishnadevaraya Andhra Bhasha Nilayam', ['Osmania University Library', 'Salar Jung Museum', 'State Central Library'], 'Named after a great Vijayanagara king.', 'It was founded in 1901.'],
        ]),
        matchT('match', 'leader or organisation to its description', [
          ['Madapati Hanumantha Rao', 'Andhra Jana Sangham; “Andhra Pitamaha”'], ['Suravaram Pratapa Reddy', 'Golconda Patrika; Jogipet conference'], ['Swami Ramananda Tirtha', 'Leader of the State Congress'],
          ['Andhra Jana Sangham', 'Formed 1921'], ['Andhra Maha Sabha', 'Took up peasant issues from 1930'], ['Library movement', 'Started with a Telugu library in 1901'],
        ], ['Three people, three organisations.', 'Jogipet is linked with the Maha Sabha.']),
      ],
    },
    {
      id: 'ts8.ss.hyd.struggle', title: 'The Telangana armed struggle, women in the struggle and the merger with India', prereqs: ['ts8.ss.hyd.orgs'],
      intro: [
        h('Peasants rise against the doras'),
        photo('🌾', 'The struggle was about land, freedom from vetti and an end to feudal oppression.'),
        p('By the 1940s, the Andhra Maha Sabha, with communist leadership in many areas, organised peasants against vetti, illegal levies and eviction. On 4 July 1946, Doddi Komaraiah was killed by the men of a landlord in Kadavendi (Jangaon); his death sparked the armed struggle. Chakali Ilamma (Ailamma), a washerwoman of Palakurthi, had already resisted the deshmukh who tried to seize her harvest and land. Village committees (sanghams) took over land of big landlords and distributed it among the poor; vetti was abolished in these villages.'),
        def('Razakars', 'An armed militia led by Qasim Razvi that supported the Nizam’s plan to stay independent and attacked villagers and opponents in 1947–48.'),
        p('Women played major roles — as fighters, couriers and organisers. Mallu Swarajyam, Arutla Kamala Devi, Chityala Ilamma and many others are remembered. After independence the Nizam signed a Standstill Agreement (November 1947) but did not join India. Violence by Razakars grew. On 13 September 1948 the Indian Army entered the state (“Operation Polo”, the Police Action); on 17 September 1948 the Nizam’s forces surrendered and Hyderabad became part of India.'),
        stepsB('4 July 1946: death of Doddi Komaraiah; armed struggle begins.', 'November 1947: Standstill Agreement with India.', '13–17 September 1948: Police Action; Hyderabad joins India on 17 September.', '1949: Hyderabad Jagirdari Abolition Regulation.', '1951: the armed struggle is withdrawn.', '1952: first elected government under Burgula Ramakrishna Rao.', '1 November 1956: Telangana region merged into Andhra Pradesh.'),
        keys('Armed struggle 1946–51 against doras, vetti and the Nizam’s rule.', 'Doddi Komaraiah and Chakali Ilamma: symbols of resistance.', 'Women fighters: Mallu Swarajyam, Arutla Kamala Devi.', '17 September 1948: Hyderabad becomes part of India.'),
        remember('17 September is observed in Telangana as the day Hyderabad State joined the Indian Union.'),
        tip('Write about the struggle with care: it was a peasant movement for land and dignity, and also a complex period of violence on several sides.'),
      ],
      examples: [
        ex('Why is Chakali Ilamma remembered?', ['She was a washerwoman of Palakurthi who refused to give up her land and harvest to a powerful deshmukh.', 'With the Sangham’s help she resisted.', 'She became a symbol of courage of ordinary people, especially women and backward castes.'], 'For resisting a powerful landlord — a symbol of courage'),
        ex('What was the Police Action of 1948?', ['The Nizam had not joined India and Razakar violence was growing.', 'The Indian Army moved into Hyderabad on 13 September 1948.', 'The Nizam’s forces surrendered on 17 September, and Hyderabad joined India.'], 'Indian military operation that brought Hyderabad into India'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of 1946–1956 in time order.', [
          [1946, 'Doddi Komaraiah killed; armed struggle begins', '4 July 1946'], [1947, 'Standstill Agreement with India', 'November 1947'],
          [1948, 'Police Action; Hyderabad joins India', '17 September 1948'], [1951, 'Armed struggle withdrawn', '1951'],
          [1952, 'First elected government (Burgula Ramakrishna Rao)', '1952'], [1956, 'Telangana merged into Andhra Pradesh', '1 November 1956'],
        ], ['The struggle began before independence.', 'Andhra Pradesh was formed in 1956.']),
        mcq('mcq', 'Key people and dates of 1946–48.', [
          ['The armed struggle was sparked by the death of…', 'Doddi Komaraiah (1946)', ['Komaram Bheem (1940)', 'Turrebaz Khan (1857)', 'Alluri Sitarama Raju (1924)'], 'At Kadavendi.', 'Doddi Komaraiah was killed on 4 July 1946.'],
          ['Hyderabad became part of India on…', '17 September 1948', ['15 August 1947', '26 January 1950', '1 November 1956'], 'After the Police Action.', 'The Nizam’s forces surrendered on 17 September 1948.'],
          ['The Razakars were led by…', 'Qasim Razvi', ['Swami Ramananda Tirtha', 'Ravi Narayan Reddy', 'Mallu Swarajyam'], 'A militia leader.', 'Qasim Razvi led the Razakars.'],
          ['Which woman is remembered for resisting a deshmukh in Palakurthi?', 'Chakali Ilamma', ['Sarojini Naidu', 'Rani Lakshmibai', 'Annie Besant'], 'A washerwoman.', 'Chakali Ilamma resisted the deshmukh’s attempt to seize her land.'],
          ['The military operation of September 1948 is known as…', 'Operation Polo (Police Action)', ['Operation Blue Star', 'Quit India', 'Operation Flood'], 'Named after a sport.', 'Operation Polo integrated Hyderabad into India.'],
          ['One major demand of the peasant struggle was…', 'An end to vetti and land for the tiller', ['More taxes', 'Return of the British', 'Abolition of schools'], 'Forced labour.', 'Peasants fought against vetti and for land.'],
        ]),
        matchT('match', 'person to the role', [
          ['Doddi Komaraiah', 'Martyr whose death began the struggle'], ['Chakali Ilamma', 'Washerwoman who resisted a deshmukh'], ['Mallu Swarajyam', 'Woman fighter in the struggle'],
          ['Qasim Razvi', 'Leader of the Razakars'], ['Burgula Ramakrishna Rao', 'First elected Chief Minister of Hyderabad State'], ['Mir Osman Ali Khan', 'Last Nizam'],
        ], ['One led a militia.', 'Burgula took office in 1952.']),
      ],
    },
  ],
};

