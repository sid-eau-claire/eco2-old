import sys
import json
import psycopg2
from lxml import etree

# Database connection parameters
dbname = 'strapi'
user = 'strapi'
password = '$Ait2023'
host = 'localhost'

# Namespace for parsing XML
namespaces = {'ns': 'http://ACORD.org/Standards/Life/2'}

# Connect to the PostgreSQL database
def connect_to_db():
    return psycopg2.connect(dbname=dbname, user=user, password=password, host=host)

# Function to insert data into the cits_clients table
def insert_clients_into_db(conn, client_data):
    cursor = conn.cursor()
    insert_sql = """
        INSERT INTO citsclients (
            clientid, carriercode, party_type_code, first_name, last_name, occupation, gender, birth_date, 
            address_type_code, line_1, city, state_code, zip, country_code, phone_type_code, 
            phone_country_code, area_code, dial_number, preferred_language, email_type, email_address, agentid
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (clientid, carriercode) DO UPDATE SET
            party_type_code = COALESCE(EXCLUDED.party_type_code, citsclients.party_type_code),
            first_name = COALESCE(EXCLUDED.first_name, citsclients.first_name),
            last_name = COALESCE(EXCLUDED.last_name, citsclients.last_name),
            occupation = COALESCE(EXCLUDED.occupation, citsclients.occupation),
            gender = COALESCE(EXCLUDED.gender, citsclients.gender),
            birth_date = COALESCE(EXCLUDED.birth_date, citsclients.birth_date),
            address_type_code = COALESCE(EXCLUDED.address_type_code, citsclients.address_type_code),
            line_1 = COALESCE(EXCLUDED.line_1, citsclients.line_1),
            city = COALESCE(EXCLUDED.city, citsclients.city),
            state_code = COALESCE(EXCLUDED.state_code, citsclients.state_code),
            zip = COALESCE(EXCLUDED.zip, citsclients.zip),
            country_code = COALESCE(EXCLUDED.country_code, citsclients.country_code),
            phone_type_code = COALESCE(EXCLUDED.phone_type_code, citsclients.phone_type_code),
            phone_country_code = COALESCE(EXCLUDED.phone_country_code, citsclients.phone_country_code),
            area_code = COALESCE(EXCLUDED.area_code, citsclients.area_code),
            dial_number = COALESCE(EXCLUDED.dial_number, citsclients.dial_number),
            preferred_language = COALESCE(EXCLUDED.preferred_language, citsclients.preferred_language),
            email_type = COALESCE(EXCLUDED.email_type, citsclients.email_type),
            email_address = COALESCE(EXCLUDED.email_address, citsclients.email_address),
            agentid = COALESCE(EXCLUDED.agentid, citsclients.agentid);
    """
    cursor.execute(insert_sql, (
        client_data['client_id'], client_data['carrier_code'], client_data['party_type_code'] , client_data['first_name'], 
        client_data['last_name'], client_data['occupation'], client_data['gender'], client_data['birth_date'], 
        client_data['address_type_code'], client_data['line1'], client_data['city'], client_data['state_code'], 
        client_data['zip'], client_data['country_code'], client_data['phone_type_code'], 
        client_data['phone_country_code'], client_data['area_code'], client_data['dial_number'], 
        client_data['preferred_language'], client_data['email_type'], client_data['email_address'], client_data['agentid']
    ))
    conn.commit()
    cursor.close()


# Function to insert data into the cits.coverages table
def insert_coverage_into_db(conn, coverage_data):
    cursor = conn.cursor()
    # SQL statement includes ON CONFLICT clause to handle existing records
    upsert_sql = """
        INSERT INTO citscoverages (
            pol_number, plan_name, product_code, cov_number, life_cov_status, life_cov_type_code,
            indicator_code, lives_type, expiry_date, current_amt, modal_prem_amt,
            annual_prem_amt, eff_date, tobacco_premium_basis, issue_gender, participants
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (pol_number, cov_number) DO UPDATE SET
            plan_name = EXCLUDED.plan_name, product_code = EXCLUDED.product_code, 
            life_cov_status = EXCLUDED.life_cov_status, life_cov_type_code = EXCLUDED.life_cov_type_code,
            indicator_code = EXCLUDED.indicator_code, lives_type = EXCLUDED.lives_type, 
            expiry_date = EXCLUDED.expiry_date, current_amt = EXCLUDED.current_amt, 
            modal_prem_amt = EXCLUDED.modal_prem_amt, annual_prem_amt = EXCLUDED.annual_prem_amt, 
            eff_date = EXCLUDED.eff_date, tobacco_premium_basis = EXCLUDED.tobacco_premium_basis, 
            issue_gender = EXCLUDED.issue_gender, participants = EXCLUDED.participants
    """
    cursor.execute(upsert_sql, (
        coverage_data['pol_number'], coverage_data['plan_name'], coverage_data['product_code'], coverage_data['cov_number'],
        coverage_data['life_cov_status'], coverage_data['life_cov_type_code'],
        coverage_data['indicator_code'], coverage_data['lives_type'], coverage_data['expiry_date'],
        coverage_data['current_amt'], coverage_data['modal_prem_amt'],
        coverage_data['annual_prem_amt'], coverage_data['eff_date'],
        coverage_data['tobacco_premium_basis'], coverage_data['issue_gender'],
        coverage_data['participants']
    ))
    conn.commit()
    cursor.close()


# Function to insert data into the cits_policies table
def insert_policy_into_db(conn, policy_data):
    cursor = conn.cursor()
    insert_sql = """
        INSERT INTO citspolicies (
            pol_number, line_of_business, product_type, product_code, carrier_code,
            plan_name, policy_status, jurisdiction, eff_date, term_date,
            paid_to_date, payment_mode, payment_amt, annual_payment_amt, primary_insured_client_id, clientid, agentid, relations
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (pol_number) DO UPDATE SET
            line_of_business = EXCLUDED.line_of_business,
            product_type = EXCLUDED.product_type,
            product_code = EXCLUDED.product_code,
            carrier_code = EXCLUDED.carrier_code,
            plan_name = EXCLUDED.plan_name,
            policy_status = EXCLUDED.policy_status,
            jurisdiction = EXCLUDED.jurisdiction,
            eff_date = EXCLUDED.eff_date,
            term_date = EXCLUDED.term_date,
            paid_to_date = EXCLUDED.paid_to_date,
            payment_mode = EXCLUDED.payment_mode,
            payment_amt = EXCLUDED.payment_amt,
            annual_payment_amt = EXCLUDED.annual_payment_amt,
            primary_insured_client_id = EXCLUDED.primary_insured_client_id,
            clientid = EXCLUDED.clientid,
            agentid = EXCLUDED.agentid,
            relations = EXCLUDED.relations;
    """
    cursor.execute(insert_sql, (
        policy_data['pol_number'], policy_data['line_of_business'], policy_data['product_type'], policy_data['product_code'],
        policy_data['carrier_code'], policy_data['plan_name'], policy_data['policy_status'], policy_data['jurisdiction'],
        policy_data['eff_date'], policy_data['term_date'], policy_data['paid_to_date'], policy_data['payment_mode'],
        policy_data['payment_amt'], policy_data['annual_payment_amt'], policy_data['primary_insured_client_id'], policy_data['client_id'], policy_data['agent_id'], policy_data['relations']
    ))
    conn.commit()
    cursor.close()

# Function to insert data into the cits_agents table
def insert_agents_into_db(conn, agent_data):
    cursor = conn.cursor()
    # SQL statement includes ON CONFLICT clause to handle existing records
    upsert_sql = """
        INSERT INTO citsagents (
            fullname, agentid, carriercode, carriername, carrierappstatus
        ) VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (agentid, carriercode) DO UPDATE SET
            fullname = EXCLUDED.fullname,
            carriername = EXCLUDED.carriername,
            carrierappstatus = EXCLUDED.carrierappstatus
    """
    cursor.execute(upsert_sql, (
        agent_data['fullname'], agent_data['agentid'],
        agent_data['carriercode'], agent_data['carriername'], agent_data['carrierappstatus']
    ))
    conn.commit()
    cursor.close()



# Function to parse the XML file and extract relevant <Policy> and <Coverage> elements, considering namespaces
def parse_xml_and_store(filename):
    tree = etree.parse(filename)
    root = tree.getroot()
    # Find the carrier code
    carrier_code = root.find('.//ns:CarrierCode', namespaces=namespaces)
    conn = connect_to_db()  # Connect to the database once

    # Iterate through <Policy> elements considering the namespace
    for policy in root.findall('.//ns:Policy', namespaces=namespaces):
        pol_number = policy.findtext('ns:PolNumber', namespaces=namespaces)

        # Find the client ID associated with this policy
        first_coverage = policy.findall('.//ns:Life/ns:Coverage', namespaces=namespaces)[0]
        life_participant_elements = first_coverage.xpath('.//ns:LifeParticipant[ns:LifeParticipantRoleCode/@tc="1"]', namespaces=namespaces)
        primary_insured_client_id = life_participant_elements[0].get('PartyID').split('_')[-1] if life_participant_elements else None
        
        # Find the primary agent associated with this policy
        agent_parties = tree.xpath(f'.//ns:Party[starts-with(@id, "PA_{pol_number}") and ns:Producer/ns:CarrierAppointment]', namespaces=namespaces)
        
        # agent_id  = parties[0].get('id').split('_')[-1] if parties else None
        agent_id = []
        for party in agent_parties:
            agent_id.append(party.get('id').split('_')[-1] if party.get('id').startswith('PA') else None)
            fullname = party.find('.//ns:FullName', namespaces=namespaces).text if party.find('.//ns:FullName', namespaces=namespaces) is not None else None
            producer = party.find('.//ns:Producer', namespaces=namespaces)
            if producer is not None:
                carrier_appointment = producer.find('.//ns:CarrierAppointment', namespaces=namespaces)
                if carrier_appointment is not None:
                    agent_data = {
                        # 'fullname': f"{party.find('.//ns:FirstName', namespaces=namespaces).text if party.find('.//ns:FirstName', namespaces=namespaces) is not None else ''} {party.find('.//ns:LastName', namespaces=namespaces).text if party.find('.//ns:LastName', namespaces=namespaces) is not None else ''}".strip(),
                        # 'clientid': party_id.split('_')[-1],
                        'fullname': fullname,
                        # 'agencyaffiliationid': carrier_appointment.get('AgencyAffiliationID'),
                        'agentid': carrier_appointment.findtext('.//ns:CompanyProducerID', namespaces=namespaces),
                        'carriercode': carrier_appointment.findtext('.//ns:CarrierCode', namespaces=namespaces),
                        'carriername': carrier_appointment.findtext('.//ns:CarrierName', namespaces=namespaces),
                        'carrierappstatus': carrier_appointment.find('.//ns:CarrierApptStatus', namespaces=namespaces).get('tc') if carrier_appointment.find('.//ns:CarrierApptStatus', namespaces=namespaces) is not None else None,
                    }
                    # Insert data into the database
                    insert_agents_into_db(conn, agent_data)
            
        # print(agent_id[0])
        # Find the relations objects associated with this policy
        relations = tree.xpath(f'.//ns:Relation[starts-with(@RelatedObjectID, "PA_{pol_number}")]', namespaces=namespaces)
        # print(relations)
        relations_json = []
        # for relation in root.findall('.//Relation'):
        for relation in tree.xpath(f'.//ns:Relation[starts-with(@RelatedObjectID, "PA_{pol_number}")]', namespaces=namespaces):
            relation_dict = {
                # 'OriginatingObjectID': relation.get('OriginatingObjectID'),
                'agent_id': relation.get('RelatedObjectID').split('_')[-1] if relation.get('RelatedObjectID').startswith('PA') else None,   
                'details': {}
            }
            # Extract child elements and their text or attributes
            for child in relation:
                if child.text is not None:
                    # print(child.tag, child.text)
                    relation_dict['details'][child.tag.split("}")[-1]] = child.text 
                elif 'tc' in child.attrib:
                    relation_dict['details'][child.tag.split("}")[-1]] = child.attrib['tc']
            relations_json.append(relation_dict)
        # relations = [relation for relation in root.findall('.//Relation') if relation.get('RelatedObjectID').startswith(pattern)]
        relations = json.dumps(relations_json, indent=4)
        
        # client_party = root.xpath(f'.//ns:Party[@id[starts-with(., "PC")]]/ns:PartyTypeCode[@tc="1"]/..', namespaces=namespaces)
        client_parties = tree.xpath(f'.//ns:Party[starts-with(@id, "PC_{pol_number}")]', namespaces=namespaces)
        client_id =  []
        for party in client_parties:
            party_id = party.get('id').split('_')[-1] if party.get('id').startswith('PC') else None
            client_id.append(party_id)
            client_data = {
                'client_id': party_id.split('_')[-1],
                'carrier_code': carrier_code.text,
                'party_type_code': party.find('ns:PartyTypeCode', namespaces=namespaces).get('tc') if party.find('ns:PartyTypeCode', namespaces=namespaces) is not None else None,
                'first_name': party.find('.//ns:FirstName', namespaces=namespaces).text if party.find('.//ns:FirstName', namespaces=namespaces) is not None else None,
                'last_name': party.find('.//ns:LastName', namespaces=namespaces).text if party.find('.//ns:LastName', namespaces=namespaces) is not None else None,
                'occupation': party.find('.//ns:Occupation', namespaces=namespaces).text if party.find('.//ns:Occupation', namespaces=namespaces) is not None else None,
                'gender': party.find('.//ns:Gender', namespaces=namespaces).get('tc') if party.find('.//ns:Gender', namespaces=namespaces) is not None else None,
                'birth_date': party.find('.//ns:BirthDate', namespaces=namespaces).text if party.find('.//ns:BirthDate', namespaces=namespaces) is not None else None,
                'address_type_code': party.find('.//ns:AddressTypeCode', namespaces=namespaces).get('tc') if party.find('.//ns:AddressTypeCode', namespaces=namespaces) is not None else None,
                'line1': party.find('.//ns:Line1', namespaces=namespaces).text if party.find('.//ns:Line1', namespaces=namespaces) is not None else None,
                'city': party.find('.//ns:City', namespaces=namespaces).text if party.find('.//ns:City', namespaces=namespaces) is not None else None,
                'state_code': party.find('.//ns:AddressStateTC', namespaces=namespaces).get('tc') if party.find('.//ns:AddressStateTC', namespaces=namespaces) is not None else None,
                'zip': party.find('.//ns:Zip', namespaces=namespaces).text if party.find('.//ns:Zip', namespaces=namespaces) is not None else None,
                'country_code': party.find('.//ns:AddressCountryTC', namespaces=namespaces).get('tc') if party.find('.//ns:AddressCountryTC', namespaces=namespaces) is not None else None,
                'phone_type_code': party.find('.//ns:PhoneTypeCode', namespaces=namespaces).get('tc') if party.find('.//ns:PhoneTypeCode', namespaces=namespaces) is not None else None,
                'phone_country_code': party.find('.//ns:CountryCode', namespaces=namespaces).text if party.find('.//ns:CountryCode', namespaces=namespaces) is not None else None,
                'area_code': party.find('.//ns:AreaCode', namespaces=namespaces).text if party.find('.//ns:AreaCode', namespaces=namespaces) is not None else None,
                'dial_number': party.find('.//ns:DialNumber', namespaces=namespaces).text if party.find('.//ns:DialNumber', namespaces=namespaces) is not None else None,
                'preferred_language': party.find('.//ns:Client/ns:PrefLanguage', namespaces=namespaces).get('tc') if party.find('.//ns:Client/ns:PrefLanguage', namespaces=namespaces) is not None else None,
                'email_type': party.find('.//ns:EMailAddress/ns:EMailType', namespaces=namespaces).get('tc') if party.find('.//ns:EMailAddress/ns:EMailType', namespaces=namespaces) is not None else None,
                'email_address': party.find('.//ns:EMailAddress/ns:AddrLine', namespaces=namespaces).text if party.find('.//ns:EMailAddress/ns:AddrLine', namespaces=namespaces) is not None else None,
                'agentid': agent_id[0],
            }
            # Insert data into the database
            insert_clients_into_db(conn, client_data)
            # print(client_data)                  

        policy_data = {
            'pol_number': pol_number,
            'line_of_business': policy.find('ns:LineOfBusiness', namespaces=namespaces).get('tc'),
            'product_type': policy.find('ns:ProductType', namespaces=namespaces).get('tc'),
            'product_code': policy.findtext('ns:ProductCode', namespaces=namespaces),
            'carrier_code': policy.findtext('ns:CarrierCode', namespaces=namespaces),
            'plan_name': policy.findtext('ns:PlanName', namespaces=namespaces),
            'policy_status': policy.find('ns:PolicyStatus', namespaces=namespaces).get('tc'),
            'jurisdiction': policy.find('ns:Jurisdiction', namespaces=namespaces).get('tc'),
            'eff_date': policy.findtext('ns:EffDate', namespaces=namespaces),
            'term_date': policy.findtext('ns:TermDate', namespaces=namespaces),
            'paid_to_date': policy.findtext('ns:PaidToDate', namespaces=namespaces),
            'payment_mode': policy.find('ns:PaymentMode', namespaces=namespaces).get('tc'),
            'payment_amt': policy.findtext('ns:PaymentAmt', namespaces=namespaces),
            'annual_payment_amt': policy.findtext('ns:AnnualPaymentAmt', namespaces=namespaces),
            'primary_insured_client_id': primary_insured_client_id,
            'client_id': client_id,
            'agent_id': agent_id,
            'relations': relations,
        }

        insert_policy_into_db(conn, policy_data)  # Insert policy data into cits_policies
        # print(policy_data)

        # Iterate through each <Coverage> within this policy
        for coverage in policy.findall('.//ns:Life/ns:Coverage', namespaces=namespaces):
            life_participants = []
            for life_participant in coverage.findall('.//ns:LifeParticipant', namespaces=namespaces):
                participant_dict = {}
                # Extract attributes of LifeParticipant
                if 'PartyID' in life_participant.attrib:
                    participant_dict['client_id'] = life_participant.attrib['PartyID'].split('_')[-1]
                # Extract child elements of LifeParticipant
                for child in life_participant:
                    # Check for text content and tc attribute
                    if child.text:
                        participant_dict[child.tag.split("}")[-1]] = child.text
                    if 'tc' in child.attrib:
                        participant_dict[child.tag.split("}")[-1]] = child.attrib['tc']
                
                life_participants.append(participant_dict)

            # Convert the list of participant dictionaries to a JSON string
            participants = json.dumps(life_participants, indent=4)
            coverage_data = {
                'pol_number': pol_number,
                'plan_name': coverage.findtext('ns:PlanName', namespaces=namespaces),
                'product_code': coverage.findtext('ns:ProductCode', namespaces=namespaces),
                'cov_number': coverage.findtext('ns:CovNumber', namespaces=namespaces),
                'life_cov_status': coverage.find('ns:LifeCovStatus', namespaces=namespaces).get('tc'),
                'life_cov_type_code': coverage.find('ns:LifeCovTypeCode', namespaces=namespaces).get('tc'),
                'indicator_code': coverage.find('ns:IndicatorCode', namespaces=namespaces).get('tc'),
                'lives_type': coverage.find('ns:LivesType', namespaces=namespaces).get('tc'),
                'expiry_date': coverage.findtext('ns:ExpiryDate', namespaces=namespaces),
                'current_amt': coverage.findtext('ns:CurrentAmt', namespaces=namespaces),
                'modal_prem_amt': coverage.findtext('ns:ModalPremAmt', namespaces=namespaces),
                'annual_prem_amt': coverage.findtext('ns:AnnualPremAmt', namespaces=namespaces),
                'eff_date': coverage.findtext('ns:EffDate', namespaces=namespaces),
                'tobacco_premium_basis': coverage.find('ns:TobaccoPremiumBasis', namespaces=namespaces).get('tc'),
                'issue_gender': coverage.find('ns:IssueGender', namespaces=namespaces).get('tc'),
                'participants': participants,
                # 'client_id': client_id,
            }

            insert_coverage_into_db(conn, coverage_data)  # Insert coverage data into cits.coverages
                            

    conn.close()  # Close the database connection

if len(sys.argv) > 1:
    file = sys.argv[1]
else:
    file = 'bob.xml'
parse_xml_and_store(file)


