/*
********************* JavaScript Ajax table ********************
v 2.2.10
by Dvestezar www.dvesstezar.cz
využívá knihovny
  - jQuery (psáno s 1.8.3)
  - JB

použití  tblxxx = new JBajaxtable.init(sqlname,idtbl,{order,fields,sqlparam,order_ren,elementerror,
						bodyheight,trsel,trCSS,addquery,ontrcreate,ontdcreate,onheadertdclick,onadddataloaded,onselect})

	kde
		idtbl		= ID DIVu pro tabulku - text id elementu v html (div musí existovat třeba jen <div id="xxx"></div>)
		sqlname		= jméno sql řetězce z XML
		objekt nepovinných parametrů
			title		= nastaví nadpis tabulky, na následující změny lze použít funkci .setNadpis, pokud není zadáno, je použito '' a TR s nadpisem je skryt
			firstread	= jestli se mají data načíst pri inicializaci, nebo bude první načtění vyvoláno až kódem přes refresh
						default je true
			order		= jméno fieldu podle kterého se má řadit / pro sestupné se přidá ' DESC' tj 'fieldxxx desc'
			fields		= definování názvů a skrytí fieldu
						- object {'filed':'nazev','field2':'nazev2'}
							kde
								field = název fieldu u SQL - používat uzavírání v apostrofech, protože SQL dotazy používají jména jako 'tabulka.field'
								nazev = název který bude zobrazen,
									  pokud
										1) je zadán prázdný název, bude field(sloupec) vynechán
										2) pokud bude první znak vykřičník, nebude na tomto fieldu(sloupci) fungovat řazení kliknutím na hlavičku sloupce
			selectable	=	default=prázdný řetězec jinak obsahuje řetězec názvu klíčového fieldu
							pokud je název nalezen, tak je zprovozněno vybírání řádků a propertie tohoto objectu ".val", popis viz níže,
							v základu jde vybrat jen jeden řádek, viz další proměnná
			multiselect =   default je false, pokud není zadána předchozí proměnná, je tato volba ignorována
							pokud true, lze vybrat více řádků, ovlivňuje propertie tohoto objektu ".val" viz níže
							tato hodnota lze měnit za běhu funkcí na tomto objektu ".changeMultiselect(bool)"
			set_element_on_sel = default undefined pokud nastaveno tak obsahuje HTML form element nebo jeho string ID, jako je textarea, text, hidden atp.,
							který bude nasteven po selectu
			sel_element_json = default=false, pokud true, vrátí do value elementu vybrané hodnoty(pole) jako JSON text
			set_HTMLinner_on_sel = default undefined pokud nastaveno tak bude nstaveno HTMLinner objektu - 
							bsahuje HTML jakýkoliv element nebo jeho string ID, jako je DIV SPAN atp
			
			showfilters = jestli se má zobrazit tlačítko pro filtrování sloupců, max počtu řádků atp. v hlavičce
						default je false (bezpečnost)
			sqlparam	= objekt parametrů které budou odeslány jako json string v parametru "p"
						př.: skrip na serveru nahradí v řetězci SQL parametry z této proměnné
						- v sql dotazu jsou definovány proměnné začínající znakem @
						- př.: v sql  proměnné @dt a @neco definujeme jako objekt
							{dt:'2011-11-01',neco:'cokoliv'}
			scriptfilename = možnost změnit základní ovládací script 'get_tbl.asp'
			
			offlinedata = pole které je normálně vraceno jako JSON, pokud je použito toto, nebude volán ajax JSON, ale vemou se data z této proměnné
						bude ignorováno vše co je spojené s online definicí a aktualizací jako sqlname sqlparam, scriptfilename order ordering atp ...
						!!! sqlname musí být zadáno jako prázdný řetězec !!!!
						U offline nefunguje refresh a menu pro zobrazení sloupců a autorefresh
						není ignorováno fileds
						data musí mít formát jako JSON co vrací ajax, povinné je data nebo ArrData a nepovinné adddata
						
						ostatní povinná property ajax JSON se nastaví automaticky
						tj.
							{
								data:assocarray,
								ArrData:headarray,
								adddata:{
									table1:{assocarray},
									table2:{assocarray}
								},
								msg:'OK',		//automat
								sel:0,			//automat
								pg:0,			//automat
								maxrow:9999999,	//automat
								cnt:1,			//automat
								colsinfo : undef //nevyužito
							}
						
						
						Příklad headarray
						1.index musí obsahovat názvy fieldů
						2. a následující jsou data fieldů
						př.
						[
							[fieldname1,filedname2, ....],
							[valfield1,valfiled2, ....],	//1.row dat nebo row index 0
							[valfield1,valfiled2, ....],	//2.row dat nebo row index 1
							....
						]
			
						Příklad assocarray
						[
							{'filedname1':'value','filedname2':value}, //row 1 index0
							{'filedname1':'value','filedname2':value}, //row 2 index1
							....
							n_row
						]
						
			ordering = jestli má být dostupná fukce řazení a jestli zobrazovat jak je řazeno, default je true
			order_ren	= objekt podmínek řazení
						  {fieldname:{s:'zobrazene jmeno v řádku řezeno',da:'definice řazení sestupně',dc:'definice řazení vzestupně'},fieldname2:{s:'xx',da:'def asc',dc:'def desc'}...}
						!!! fieldname se doporučuje používat v apostrofech - SQL může používat jména fieldu jako 'tabulka.field'
						- pokud není použito je pro řazení použito fieldů z headeru tabulky pro daný sloupec
						  tzn. pokud klikneme na header sloupce 1 kde jméno je fielname bude do SQL použito 'ORDER BY diledname popř DESC'
						  
						  kde
							da = pokud má první sloupec jmeno fieldu 'fieldname', pak po kliknutí na sloupec
							     nebude použito 'order by fieldname' ale podle 'da' 'order by 'definice řazení sestupně''
							     tak lze zadat kombinované řazení jako např. 'filed1 desc, field2, field3 desc'
							     po znovukliknutí na header sloupce je použito definice z 'dc'
							dc = pokud není zadáno 'dc' tak je umožněno řazení jen podle 'da'
							s  = zobrazené jméno které je zobrazeno pro tuto definici

							filedname je skutečný název fieldu z sql
							
						  takto lze zadat složitá řazení s jednoduchým zobrazení názvu
						  's' a 'da' musí být zadány, jinak nebudou použity
						  
						  pro zobrazení názvů řazení fieldů je použit buď přímo fieldname, nebo názvu
						  z předchozího object parametru 'fields' - definování názvů a skrytí fieldu
						  
			ordermax	= default = 2
						 kolik se má pamatovat kliknutí řazení
						 př.: klikneme na sloupec1(filed1) budeme řatit podle field1
						      dál klikneme na sloupec2(field2) tak budeme řadit podle field2 a potom field1
						      dál klikneme na sloupec3(field3) tak budeme řadit podle field3 a potom field2
						      dál klikneme na sloupec3(field3) tak budeme řadit podle field3 desc a potom field2
							    -změní se jen řazení field3
						      dál klikneme na sloupec2(field2) tak budeme řadit podle field2 a potom field3
						      dál klikneme na sloupec1(field1) tak budeme řadit podle field1 a potom field2
							  atd...
			
			addquery	= řetězec názvů dotazů SQL definovaných v XML, parametry jsou použity z předchozího parametry
						pro toto nelze použít order, jen v definici XML
						př:'dotaz1,dotaz2'
						script serveru vrádí dodatečné dotazy v root vrácených dat jako add_data.dotazx.data
						toto je provedeno jen jednou při prvním spuštění(načtení stránky a inisializaci)
						tyto data jsou připojeny k hlavním DIV jako property .add_data
						tzn. přístup k nim z venku je 
						  document.getElementById('xxx').add_data
						zevnitř
						  ELtbl.add_data
						-pokud potřebujeme znovu načíst dodatečná data zavoláme .ResetAddDataFlag() .refresh()
			addquery_eve - default je false, pokud true tak adddata jsou načtená pokaždé, pokud false tak platí předchozí
			
			printname	= obsah nadpisu na tisknuté stránce, pokud není zadáno je použit default 'Tisk AJAX Table'
							lze ovlivnit funkcí SetPrintName(name)
			showprint	= když false tak není v hlavičce zobrazen odkaz na Tisk, pokud není zadáno tak je použit default true
			
			autorefresh = default 0 , 0=zakázáno, jinak čas v sekundách kdy se bude tabulka obnovovat (min je 60s)
			
			elementerror= html element DIV který bude obsahovat chybové zprávy
						- pokud není zadán, bude vytvořen pod FOOT tabulky řádek ve kterém se zprávy budou zobrazovat
			bodyheight	= pokud je nastaveno, tak se omezí velikost těla tabulky na určenou výšku (zadává se jako řetězec i s jednotkami jako px atp.)
						tzn.hlavička bude stálá a tělo bude scrollovatelné
			trsel		= bude zvýrazněno CSStřídou trCSS pokud true - default je true / nemusí být zadáno
			trCSS		= definování CSS třídy pro zvýraznění, pokud je trsel true - default CSS je sel_lr
			
	Events:
			sqlparamfn  = funkce pro získání objektu parametrů při refresh, fn je volána před odesláním parametrů
							- funkce je volána funkce(objekt_sqlparametru)
							- tato funkce může objekt paramterů generovat, v tom případě je sqlparam ignorováno
								tzn. objekt_sqlparametru zapomenout a zcela vygenerovat nový
							- pokud funkce vrátí null, tak není dotaz proveden, bude zastaveno refresh - refresh je tímto zakázán, např chybné údaje
							- jinak musí funkce vrátit objekt parametrů, který je převeden do json string a odeslán jako parametr "p"
			onbefortrcreate = fn folaná před vytvořením elementu řádky function(tbl,newdata,olddata,idx)
						kde
						- tbl je element tabulky
							-> tbl.toto = tento object
							-> tbl.var = pole dat z kterých je generovaná tabulka
						- olddata jsou data pro předešlý řádek
						- newdata jsou data pro nový řádek
						- idx je index řádku z pole dat
			ontrcreate	= fn volaná před vytvořením řádku tabulky, tj TR je vytvořen ale není vyplněn buňkami function(tr)
						kde
						tr je element řádky tabulky
						tr.val jsou objekt ze kterého se generuje řádek
						potom 
						tr.val.fieldnameN0=value
						až
						tr.val.fieldnameNx=value
						tr.val={field1:val1,field2:val2 ....}
			onaftertrcreate = jako předchozí onbefortrcreate ale je volána až po vytvoření řádky, parametry stejné
			ontdcreate	= fn volaná při vytvoření buňky tabulky function(td) 
						kde
						td je element buňky tabulky
						td.val je hodnota kterou obsahuje buňka
						td.field je název fieldu (sloupce)			
			onheadertdclick = fn volaná při kliknutí na buňku v hlavičce tabulky function(td) kde td je elemen buňky tabulky
						-funkce může vrátit false pro zákázání provedení interního (zmenu)řazení, které je standartně provedeno
			ondblclick	= fn volaná při dvojkliku na datové buňky - function() přístup k datům je přes this, this=objekt tr tzn this.val jsou data řádku tr.val
			onadddataloaded = fn je volána jen při načtení dodatečných dat (script serveru je vrátí) function(add_data) kde add_data je objekt vrácených dat
							tato fn je volána i když jsou hlavní data EMPTY
			ondataloaded = fn(odkaz na element div pro tabulku) je volána po načtení dat pro tabulku, těsně před jejím generování(tabulka je zrovna smazána, přístup k datům jako předchozí)
			onemptydata  = fn je volána, když byly vráceny prázdná data, v tomto případě není volána ani onadddataloaded ani ondataloaded, tato funkce je pro ošetření
			ontablefinish = fn(odkaz na element div pro tabulku) je volána po vygenerování tabulky
			onselect	= fn volaná při kliknutí myší na řádek - function() ve funkci this.val je přístup k datům
		
jediné povinné údaje jsou sqlnane, a idtable
přístup k objektu je zajištěn vytvořenou proměnnou v DIVu volaného při vytváření
	document.getElementById('xxx').ajxtbl
		kde xxx je ID DIVu ve kterém je tabulka vytvářena

přístup do objektu je také možný přes proměnnou která je vrácena funkcí při jeho vytváření, pokud je var používána globálně

proměnné využitelné pro případné funkce ontrcreate,ontdcreate
	na každém td bude vytvořeno property
		.val = hodnota buňky
		.field = skutečný název fieldu z sql(toto je i u buněk hlavičky, hlavička nemá hodnotu .val)
		.toto = tento objekt
		.tbl = je element tabulky
		.tr je odkaz na objekt fieldů ze kterého je generován řádek, stejné jako tr.val
		.tr_el = odkaz na element TR který obsahuje tuto buňku
	na každém tr těla tabulky bude vytvořen property
		.val = objekt z kterého byl generován řádek tzn.: {field1:val1,field2:val2 ....}
		.toto = tento objekt
		.tbl = je element tabulky
	document.getElementById('xxx').ajxtbl.val
		- obsahuje objekt poslední načtená data přes ajax, z těchto dat je generována tabulka
		  obsahuje i info o stránce, počtu řádků, omezení řádků atp
		  objekt
			.data = pole objektů - řádků
			.cnt  = celk.počet záznamů
			.maxrow = na kolik je omezeno zobrazení počtu řádků
			.pg	 = max.strana (pro zobrazení počet stran je pg+1)
			.sel	 = vybraná strana (pro zobrazení strany je sel+1)
			.msg  = musí se rovnat "OK", jinak obsahuje chybu vrácenou serverem
		  pokud je cnt>maxrov tak je použito stránkování

funkce použitelné zvenku
	.setNadpis(tx) = změna nadpisu tabulky, '' skryje TR nadpisu
	.setSouhrn(tx) = změna souhrnu tabulky
	.setPopis(tx)  = změna popisu tabulky
	popis a souhrn se maží s update nebo clear tabulky
	
	.refresh()
		- document.getElementById('xxx').ajxtbl.refresh()
		  nebo přímo proměnnou získanou při vytvoření  inic_var.refresh()
		provede znovunačtení a vygenerování tabulky podle zapamatovaných nebo změněných údajů
		- ! vrací
			true - pokud je vše OK
			false - pokud v uživatelské funkci get sql param došlo k chybě, jako třeba špatně vyplněný formulář
	.ResetAddDataFlag()
		- resetuje příznak načtení dodatečných dat, tzn.při příštím refresh nebo operaci s tabulkou budou znovu načtena
	.SetCollVisible(fieldname,visible)
		- nastaví viditelnost sloupce na ano/ne / nastavení neviditelnosti v objektu "fields" při vytváření má prioritu
		- "visible" = true/false
		- "fieldname" = je jméno fieldu, který má být skryt
		
	.getTableRef() vrátí referenci na htmlelement object tabulky
	.SetPrintName(name) nastaví print nadpis
	
	.val() vrátí vybrané hodnoty z označených řádků jako pole řetězců podle voleb při vytváření viz výše - selectable	multiselect
			pokud multiselect = false tak je vráceno jednorozměrné pole, pokud není select zprovozněno, tak je vráceno jen []
			vybírá podle klíče v "selectable" při vytváření
	.val(array) vybere(označí) řádky podle vstupního pole řetezců
			pokud multiselect = false tak je vybrána hodnota v poli[0]
			př:["1","ba"] vybere řádky, které obsahují tyto hodnoty, podle klíče v "selectable" při vytváření
	.GetLastSelectedVal() vrací hodnotu posledního vybraného řádku podle selectable
	.changeMultiselect(bool) nastaví multiselect
	
funkce ovlivňující SQL hledání z venku
	volají se přes podle id hlavního DIV volaného při inicializaci
	- př: pokud vytváříme tabulku v DIV ID="xxx" tak funkce voláme
	document.getElementById('xxx').ajxtbl.SetOrder('filed desc,field2,field3 desc')
	nebo přímo inic_var.SetOrder('filed desc,field2,field3 desc')
	
	- př2:pokud v SQL řetězci máme definovány proměnné @od a @do
		funkce nepřepisuje ale definuje nový objekt, takže pokud některé proměnné nehceme měnit, musejí být stejně definovány
	document.getElementById('xxx').ajxtbl.SetParam({od:'2011-11-01',do:'2011-12-01'})
	nebo přímo inic_var.SetParam({od:'2011-11-01',do:'2011-12-01'})

	SetOrder(order)
		Nastavení řazení SQL dotazu (ORDER BY) obsahuje jen to co by mělo být za order by
	SetParam(param)
		params = objekt jako sqlparams při vytváření
		Nastavení parametrů hledání přes proměnné (WHERE) nebo podle zpracování na straně serverscriptu
		
	př.SQL řetězce:
	select kdo,kdy from tabulka where kdy between '@od' and '@do'
		doplnění order a datumů zajistí serverscript 


CSS
hlavní DIV/pouzdřící tabulka>TR(head,body,foot,err)/tabulka(head,body) - foot a err nemají tabulku jen innerHTML)

ajaxtblmain = TABLE pouzdřící tabulka každý řádek obsahuje hlavní složku jaho head, body atp, v body je tabulka dat

ajaxtblnadpis = TR řádek pro nadpis tabulky nastavuje se setNadpis
ajaxtblpopis = TR kam se dává popis tabulky, nastavuje se setPopis
ajaxtblord	= TR řádek kde je zobrazen text jak je řazeno a obnov tabulku
ajaxtblhead = TR řádek head, je v něm uložena pohyblivá hlavička tabulky při omezené výšce tabulky
ajaxtblbody = TR řádek obsahující tabulku s daty
	ajaxtblbodydata = TABLE obsahující data, tj tabulka se názvy řádků a daty
ajaxtblsuma = TR pro zobrazení zesumírování tabulky nastavuje se setSouhrn
ajaxtblfoot = TR řádek foot, pro zobrazení poštu stránek skriptem
ajaxtblerr  = TR nevyužit pokud není zadán externí element, jinak řádek s případnou chybou

ajax_tbl_td_head_disabled, ajax_tbl_td_head_enabled = je aplikováno na buňku v hlavičce tabulky, enabled pokud je umožněno kliknutím řazení

ajaxtblheadinner = TR  řádek hlavičky
	--> jeho buňky TD obsahují CSS "tr0" až "trNN" kde NN je číslo sloupce
ajaxtblbodyinner = TR (vždy je definován s ajaxtblbodyinner_tr0 nebo ajaxtblbodyinner_tr1 tr0 má každý první a tr1 každý druhá řádek)
    --> jeho buňky TD obsahují CSS "tr0" až "trNN" kde NN je číslo sloupce

ajaxtblbodyinner_tr0 = obsahuje každý první řádek TR těla dat
ajaxtblbodyinner_tr1 = obsahuje druhý první řádek TR těla dat


******** formát tlačítek v hlavičce a footu *********
pro všechny tlačítka platí
ajaxheaderbuttonlink = DIV odkazu nápisu
	-->ajaxheaderbuttoninnerlink = formát LINK v DIVu
	
navíc přidány css k předchozím tzn DIV tlačítka obsahuje např "ajaxheaderbuttonlink ajaxtblheadprint"
	ajaxtblheadotherbuttonmain = DIV pozdro pro ostatní tlačítka
		--> ajaxtblheadprint	=	DIV odkazu nápisu tisk v hlavičve tabulky
			--> ajaxtblheadprintlink = LINK tisk v hlavičve tabulky

		jako předchozí pro buton print
		--> ajaxtblheadrefr
			-->ajaxtblheadrefrlink
			
		jako předchozí, pro ostatní v DIVu ajaxtblheadotherbuttonmain
		--> ajaxtblhead_other
			-->ajaxtblhead_other_link
		

	ajaxtblheadordermain = pouzdro pro text a tlačítka řazení
		-->ajaxtblheadordermaintx =SPAN "řazeno podle"
		-->ajaxtblheadorder = jako předchozí pro butony print
			-->ajaxtblheadorder = jako předchozí pro butony print

			
	ajaxtblheadmenudiv = je DIV menu vyvolané po stisku tlačítka menu v hlavičce, přístup lze také přes ID #ajax_tbl_menu_div
	   každý button
			.ajaxtblheadmenubtn
				.ajaxtblheadmenulink
				
************* pár tipů *******************
- obarvení řádku tabulky při najetí myši - jen řádek s daty
	pomocí CSS
	.ajaxtblbodyinner:hover{
		color: #C60000;
		background-color: #FF9999;	
	}
	
	
následující je globální language proměnná
*/
var JBajaxtable_var = {
	lang : {
		raz : 'Řazeno podle',
		str : 'Strana',
		zob : 'obrazeno',
		z : 'z',
		max : 'Max',
		loading : 'Nahrávám ....',
		err_serv : 'Chyba - status serveru',
		err_script : 'Chyba vrácená scriptem serveru',
		err_js : 'Chyba JS',
		tblrefr : 'Obnovit tabulku',
		tblrefr_alt : 'Obnov obsah tabulky.',
		empty : 'Nic nenalezeno',
		rs_zobr : 'Reset zobrazení',
		rs_zobr_qe : 'Opravtu provést reset zobrazení? Budou zobrazeny všechny sloupce.',
		fltrdiv : 'Zobrazené sloupce',
		print : 'Tisk',
		print_alt : 'Tisk obsahu tabulky.',
		generuji : 'Generuji, čekej : ',
		ordby : 'Řadit podle :',
		predch_pg : 'Předchozí strana',
		nasled_pg : 'Následující strana',
		save_colsinfo : 'Chyba při ukládání infa sloupců tabulky',
		err_ret_no_obj : 'vrácená data nejsou JSON objekt',
		err_ret_no_obj_format : 'Vrácený objekt nemá formát požadovaných dat.',
		menubtn_alt : 'Menu tabulky',
		menubtn_tx : 'Menu',
		sellall : 'Vyber vše',
		sellall_alt : 'Vybere všechny řádky',
		desellall : 'Zruš výběr',
		desellall_alt : 'Zruší věškerý výběr řádků',
		selinv : 'Inveruj výběr',
		selinv_alt : 'Inveruje výběr vybraných řádků',
		err_acc_dn : 'Nepovolený přístup / Nejsi přihlášen',
		err_conect : 'Chyba připojení do databáze.',
		err_parse_user : 'Chyba parsování uživatele - nebyl přidělen přístup, nejsi přilášen, nebo jsi nebyl inicializován jako uživatel',
		err_underrgetsql : 'Chyba při získání SQL',
		err_undsqlclasscmd : 'Neexistující příkaz v registrované třídě SQL',
		err_undsqlclass : 'Neexistující třída příkazů SQL',
		err_sqlcmdfilemiss : 'Neexistující soubor s příkazy SQL',
		err_login : 'Musíš být přihlášen.',
		err_no_asign : 'Uživatel nebyl nastaven',
		mysql_err_chk_qr : 'Chyba pordpůrného dotazu SQL',
		mysql_err_main_qr : 'Chyba hlavního dotazu SQL',
		mysql_err_add_qr : 'Chyba dotazů z dotazu dodatečných dat',
		end : 'Konec'
	}
};


function JBajaxtable(in_sqlname, in_idtbl, in_p) {
	// jazyk
	var lang;

	var OnTRc; //oncreate TR function
	var OnTRce; //on after create tr fn
	var OnDTc; //oncreate TD function
	var OnSel; //onselect TR function
	var OnHdCl; //on header TD click function
	var OnADLoad; //on add_data loaded
	var OnDtLd; // on data loaded and table clear, before table create
	var OnTblFns; // po vytvoření tabulky
	var OnBefTrCr; // on before tr create	
	var IDtbl; // ID div elementu, kde bude přiřazen tento objekt - definováno na vstupu init
	var ELtbl; //element DIV pro tabulku
	var ELtblH; //vypočtená výška hlavního DIV pokud je nastavena výška tabulky pro scrolling
	var ElTblObj; //obsahuje odkaz na element vytvořené tabulky - naplní se při vytváření tabulky
	var sql = ''; //sql příkaz
	var ord = []; // řazení pole polí kde max počet je v ordmax
	// [[nm,r],[nm2,r]...]
	//	nm=řetězec filedname
	//	r==true pro DESC false pro ASC
	var ordmax = 2;//max počet řazení
	var order_ren = {}; //definice fieldů řezení
	var sqlp = {};//parametry SQL
	var ELerr;//elemend error div
	var ajx; //ajax object
	var mtbl;//hlavní tabulka pro rozdělění head,body,foot
	var nadp; //nadpis tabulky
	var tbpopis;//text popisu tabulky
	var tblr; //pro text řazení
	var tblh; //head tabulky
	var tblb; //body tabulky
	var tblf; //foot tabulky
	var suma; //sumář tabulky
	var nadp_text = '';
	var suma_text = '';
	var popis_text = '';
	var last_data; //poslední nahraná data
	var mxh;//maxheadtabulky
	var flds = {};//object fields fiz popis vstup fields
	var flds_vis = {};//objekt pro uložení viditelnosti sloupců
	var lastpg = 0;
	var trCSS;
	var trsel;
	var addquery = '';
	var add_query_get = true; //příznak načtení, načti jednou add_data lze resetovat příkazem ResetAddDataFlag()
	var fscriptfilename = 'get_tbl.asp';//filename scriptu vracející ajax data
	var ord_enable = true;//jestli má být dostupná fukce řazení a jestli se má zobrazit jak je řazeno
	var shpr = true;//showprint
	var prnm = 'Tisk AJAX Table';//printname
	var shfltr = false;//show filters in head
	var autorefresh = 0;
	var autorefrtimer = -1;
	var autorefrtx;
	var multiselect=false;
	var selectable='';
	var last_selected_val; // poslední vybraná hodnota, není to pole hodnot, ken jedna hodnota
	var set_element_on_sel;
	var sel_element_json=false;
	var set_HTMLinner_on_sel;
	var menu_div; //div element menu tabulky v headu
	var div_right_menu; // div tlačítek napravo
	var addquery_eve=false;//addquery reload every get data
	var onemptydata;
	var ondblclick;
	var sqlparamfn;
	
	var offlinedata; // data která budou použita pokud chceme tabulku jako offline

	this.ResetAddDataFlag=function () {
		add_query_get=false;
	}

	// podpurná fn pro selectování
	var cla='ajax_tbl_row_selected';
	function setcsstr(tr){
		if(tr.sel)
			jQuery(tr).addClass(cla)
		else
			jQuery(tr).removeClass(cla)
		;
	};
	
	function gen_def_styles(){
		var style = document.createElement('style');
		style.type = 'text/css';
		
		var a = '#test_tbl_ajax table{border-collapse: collapse;}';
		a +='.ajaxtblheadinner {cursor: pointer;}';
		a +='.ajaxtblhead{position:absolute}';
		a +='.ajaxtblheadmenudiv{position:absolute;display:none}'
		/*	musí být na konci definice CSS pro tabulku/y jinak difinice
			ajaxtblbodyinner_tr1 a ajaxtblbodyinner_tr1 přepíší sel_lr, pokud je
			při vytváření vnucena jiná definice, musí být tato na konci CSS
			
			.sel_lr{background-color: #ffacac;}
		*/
		
		var rules = document.createTextNode(a);
		if(style.styleSheet)
			style.styleSheet.cssText = rules.nodeValue;
		else
			style.appendChild(rules);
		document.getElementsByTagName('head')[0].appendChild(style);
	}
	function offline_data_exists(p){
		//p= objek properties z inicializace tabulky
		//vrací true, pokud offline data existují
		if(p==undefined)return false;
		if(p.offlinedata==undefined)return false;
		return true;
	}
	
	this.init = function (sqlname,idtbl,p){
		lang=JBajaxtable_var.lang;
		sqlname=String(sqlname);
		if(!offline_data_exists(p))
			if(sqlname.length<1)return;
		var a=document.getElementById(idtbl);
		if(a==undefined)return;
		if(String(a.tagName).toLowerCase()!='div')return;
		a.className += ' ajaxdivmainpouzdro';
		IDtbl=idtbl;
		gen_def_styles();
		ELtbl=a;
		ELtbl.ajxtbl=this; //zpětní kompatibilita následujícího
		ELtbl.toto=this;   //pro ajax, tento objekt
		
		//přiřazeno k hlavnímu divu, pro možné využití
		a.innerHTML='';
		a.jb_ajax_tbl=this; //na hlavnim DIV je vytvořen property pro tento object
		//vytvoř základ, tj head tabulky, tělo a foot pokud je potřeba když není zadán errobjekt
		a=document.createElement('TABLE');
		mtbl=a;
		a.className='ajaxtblmain';
		a.style.width='100%';
		ELtbl.appendChild(a);
		
		var b=mtbl.insertRow(-1);
		b.className='ajaxtblnadpis';
		nadp=b.insertCell(-1);//text jak řazeno

		b=mtbl.insertRow(-1);
		b.className='ajaxtblpopis';
		tbpopis=b.insertCell(-1);//text popisu

		b=mtbl.insertRow(-1);
		b.className='ajaxtblord';
		tblr=b.insertCell(-1);//text jak řazeno
		tblr.style.display='none';

		b=mtbl.insertRow(-1);
		b.className='ajaxtblhead';
		tblh=b.insertCell(-1);//head
		
		b=mtbl.insertRow(-1);
		b.className='ajaxtblbody';
		tblb=b.insertCell(-1);//body

		b=mtbl.insertRow(-1);
		b.className='ajaxtblsuma';
		suma=b.insertCell(-1);//sumář
		
		b=mtbl.insertRow(-1);
		b.className='ajaxtblfoot';
		tblf=b.insertCell(-1);//foot
		
		sql=sqlname;
		lastpg=0;
		if(p!=undefined){
			if(p.order!=undefined)ord=trans_ord(p.order);
			//funkce pro vygenerování parametrů
			if(p.sqlparam!=undefined)
				sqlp=JSON.stringify(p.sqlparam);
			if(p.sqlparamfn!=undefined)
				sqlparamfn=p.sqlparamfn;
			b='';
			if(p.elementerror!=undefined){
				if(String(p.elementerror.tagName).toLowerCase()=='div'){
					ELerr=p.elementerror;
				}else{
					b=mtbl.insertRow(-1);
				}
			}else{
				b=mtbl.insertRow(-1);
			}
			if(b!=''){
				b.className='ajaxtblerr';
				ELerr=b.insertCell(-1);//error
			}
			if(p.fields!=undefined)flds=p.fields;
			if(p.order_ren!=undefined)order_ren=p.order_ren;
			if(p.bodyheight!=undefined)mxh=p.bodyheight;
			if(p.ontrcreate!=undefined)OnTRc=p.ontrcreate;
			if(p.onaftertrcreate!=undefined)OnTRce=p.onaftertrcreate;
			if(p.ontdcreate!=undefined)OnDTc=p.ontdcreate;			
			if(p.onselect!=undefined)OnSel=p.onselect;			
			if(p.trsel!=undefined)trsel=p.trsel; else trsel=true;			
			if(p.trCSS!=undefined)trCSS=p.trCSS; else trCSS='sel_lr';
			if(p.ordermax!=undefined)ordmax=p.ordermax;
			if(p.addquery!=undefined)addquery=p.addquery;
			if(p.scriptfilename!=undefined)fscriptfilename=p.scriptfilename;
			if(p.showprint!=undefined){
				if(p.showprint==false)shpr=false;
			}
			if(p.showfilters!=undefined){
				if(p.showfilters==true)shfltr=true;
			}
			if(p.printname!=undefined)prnm=p.printname;
			if(p.title!=undefined)nadp_text=p.title;

			if(p.onheadertdclick!=undefined)OnHdCl=p.onheadertdclick;
			if(p.onadddataloaded!=undefined)OnADLoad=p.onadddataloaded;
			if(p.onbefortrcreate!=undefined)OnBefTrCr=p.onbefortrcreate;

			if(p.ondataloaded!=undefined)OnDtLd=p.ondataloaded;
			if(p.ontablefinish!=undefined)OnTblFns=p.ontablefinish;
			if(p.ordering!=undefined){
				if((p.ordering==true)||(p.ordering==false))ord_enable=p.ordering;
			}
			if(p.firstread==undefined)p.firstread=true;
			if(p.offlinedata==undefined){
				if(p.autorefresh!=undefined)
					if(/^\d\d*$/gi.test(String(p.autorefresh))){ //is integer
						autorefresh=p.autorefresh*1;
						if(autorefresh!=0){
							if(autorefresh<60)autorefresh=60;
						}
					}
			}
			if(p.selectable!=undefined)
				selectable=p.selectable;
			if(p.multiselect!=undefined)
				if(p.multiselect==true)
					multiselect=p.multiselect;
			if(p.set_element_on_sel!=undefined)
				set_element_on_sel=p.set_element_on_sel;
			if(p.sel_element_json!=undefined)
				if(p.sel_element_json==true)
					sel_element_json=p.sel_element_json;
			if(p.set_HTMLinner_on_sel!=undefined)
				set_HTMLinner_on_sel=p.set_HTMLinner_on_sel;
			if(p.addquery_eve!=undefined)
				addquery_eve=p.addquery_eve==true;
			if(p.onemptydata!=undefined)
				onemptydata=p.onemptydata;
			if(p.ondblclick!=undefined)
				ondblclick=p.ondblclick;
			if(p.offlinedata!=undefined)
				offlinedata=p.offlinedata;
		}else{
			p={};
			p.firstread=true;
		}
		this.setNadpis(nadp_text);
		this.setSouhrn(suma_text);
		this.setPopis(popis_text);
		
		if(p.firstread)
			this.refresh();
	}
	this.err = {};
	this.err.set = function(x){
		if(ELerr!=undefined)
			ELerr.innerHTML=x;
	}
	this.err.add = function(x){
		if(ELerr!=undefined)
			ELerr.innerHTML+=x;
	}
	function DelInnerAndChield(el){
		el.innerHTML='';
		var b=el.childNodes.length;
		for(var a=0;a<b;a++){
			el.childNodes[a].removechild();
		}
	}

	this.setNadpis=function(tx){
		nadp_text=tx;
		nadp.innerHTML=tx;
		nadp.style.display=tx==''?'none':'';
	};
	this.setSouhrn=function(tx){
		suma_text=tx;
		suma.innerHTML=tx;
		suma.style.display=tx==''?'none':'';
	};
	this.setPopis=function(tx){
		popis_text=tx;
		tbpopis.innerHTML=tx;
		tbpopis.style.display=tx==''?'none':'';
	};
	

	this.clear = function(){
		//smaž tabulku
		if(ELtbl==undefined)return;
		DelInnerAndChield(tblh);
		DelInnerAndChield(tblb);
		DelInnerAndChield(tblf);
		this.setSouhrn('');
		this.setPopis('');
		this.err.set('');	
	}
	
	this.refresh = function(){
		var b,el,d,dd;

		if(sqlparamfn!=undefined){
			sqlp=sqlparamfn(sqlp);
			if(sqlp==null)
				return false;
			sqlp=JSON.stringify(sqlp).convToUniEsc();
		}		

		d=suma_text;
		dd=popis_text;
		this.clear();
		this.setNadpis(nadp_text);
		this.setSouhrn(d);
		this.setPopis(dd);
		
		var b=add_query_get;
		if(addquery_eve)b=true;
		add_query_get=false;		
		//nastav err
		this.err.set(lang.loading);
		var mr=flds_vis['input_max_rows'];
		if(JB.is.und(mr)){
			mr=50;
		}else{
			mr=mr.vis;
		}
		if(offlinedata==undefined){
			ajx = jQuery.ajax({
				url:fscriptfilename,
				type:"post",
				data:{
					s:sql,					//identifikace SQL dotazu - název
					o:get_order_string(),	//řetězec řazení jen to co je za ORDER BY
					p:sqlp,					//objekt parametrů
					a:((b)?addquery:''),	//pokud se mají znovu načíst dodatečné dotazy, tak a obsahuje addquery
					pg:lastpg,				//poslední použitá stránka
					table:IDtbl,			//id tabulky - záleží na využití skriptem serveru
					max_row:mr  			//max záznamů na řádek
				},
				dataType:'text',//bez procesingu
				success:function(response,status,jqXHR){
					ELtbl.ajxtbl.gen(jqXHR);
				}
			});
		}else{
			r={};
			r.status=200;
			ELtbl.ajxtbl.gen(r);
		}
		return true;
	}
	this.gen= function(response){
		var ch;
		if(response.status!=200){
			try{ch=response.responseText;}catch(e){ch=e;};
			this.err.set(lang.err_serv + ' : '+response.status+'<br>'+ch);
			return;
		}
		try{
			if(offlinedata==undefined){
				a=jQuery.parseJSON(response.responseText);
			}else{
				a=offlinedata;
				ok=true;
				if(a.ArrData==undefined)ok=false;
				if(a.ArrData==null)ok=false;
				if(ok){
					a.msg='OK';        
				}else{
					a.msg='EMPTY';
				}
				a.sel=0;
				a.pg=0;
				a.maxrow=9999999;
				a.cnt=1;
			}
			// server vrátí json objekt kde msg: obsahuje stavovou zprávu pokud = "OK" tak pokračuje
			//proveď základní ověřovací testy
			//a musí být objekt
			if(typeof a != typeof {}){
				this.err.set(lang.err_script+' : '+lang.err_ret_no_obj);
				return;
			}
			//musí obsahovat .msg string se zprávou
			if(JB.is.und(a.msg)){
				this.err.set(lang.err_script+' : '+lang.err_ret_no_obj_format);
				return;				
			}
			if(!/^ok$/gi.test(a.msg)){
				//pokud není OK tak test na EMPTY jinak chyba
				this.setSouhrn('');
				this.setPopis('');
				if(/^empty$/gi.test(a.msg)){
					//může být empty ale může mát adddata
					this.testadddata(a);
					//pokud obsahuje "empty" tak byl vrácen prázdný odkaz
					a=lang.empty;
					if(offlinedata==undefined){
						a+='   <a href="" onclick="try{document.getElementById(\''+IDtbl+'\').ajxtbl.refresh();}catch(e){alert(e)};return false;">' + lang.tblrefr + '</a>';
					}
					
					tblr.style.display='none';
					tblf.style.display='none';
					
					if(!JB.is.und(onemptydata)){
						try{
							onemptydata();
						}catch(e){
							a+='  '+e;
						};
					}
					this.err.set(a);
					return;					
				}else{
					//jinak chyba
					aa=String(a.msg).toLowerCase();
					if(typeof lang[aa] != 'undefined'){
						a.msg=lang[aa];
					}else{
						x=String(a.msg).match(/^\w+(\s|$)/i);
						xx=''
						try{
							if(x.length>0){
								xx=jQuery.trim(String(x[0]).toLowerCase());
								if(typeof lang[xx] != 'undefined'){
									eval('x=/^'+x[0]+'/i');
									a.msg=String(a.msg).replace(x,'');
									xx=lang[xx];
								}
							}
						}catch(e){
							xx=e+'  ';
						}
						a.msg=xx+' '+a.msg;
					};
					this.err.set(lang.err_script+' : '+a.msg);
					return;
				}
			}
			//musí existovat .data(data jako objekt) nebo .ArrData(data jako pole)
			if(JB.is.und(a.data)&&JB.is.und(a.ArrData)){
				this.err.set(lang.err_script+' : '+lang.err_ret_no_obj_format);
				return;				
			}
			if(JB.is.und(a.ArrData)){
				//test .data na objekt
				if(typeof a.data != typeof {}){
					this.err.set(lang.err_script+' : '+lang.err_ret_no_obj_format+' - a.data');
					return;				
				}
			}else{
				//test .ArrData na pole
				if(typeof a.ArrData != typeof []){
					this.err.set(lang.err_script+' : '+lang.err_ret_no_obj_format+' - a.data');
					return;				
				}
			}
			if(ch)return;
			this.testadddata(a);
			this.gen_tbl(a);
			this.testrefreshtime();
			this.resetautorefrtime();
		}catch(e){
			this.err.set(lang.err_js+' : ' + e);
		}
	}
	this.testadddata = function(d){
		//dotatečná data
		if(!JB.is.und(d.add_data)){ //pokud je server vrátil
			ELtbl.add_data=d.add_data;
			try{if(OnADLoad!=undefined){OnADLoad(d.add_data);}}catch(e){
				chb += 'Error onloaddata fn : '+e.message+'<br><br>';
			}
		}	
	}
	this.resetautorefrtime=function(){
		var d=new Date;
		if(autorefresh>59)
			autorefrtimer=d.valueOf()+(autorefresh*1000);
	}
	this.testrefreshtime=function(){
		//autorefrtimer
		try{
			var d;
			if(autorefresh>59){
				d=new Date;
				if(autorefrtimer<d.valueOf()){
					this.refresh();
					this.resetautorefrtime();
				}
			}else autorefrtimer=-1;
			if(typeof d=='undefined')return;
			if(autorefrtx!=undefined){
				var a=autorefrtimer-d.valueOf();
				if(a<0)a=0;
				if(a>0)a=Math.floor(a/1000);
				var min=Math.floor(a/60);
				a=a % 60;
				autorefrtx.innerHTML='('+(min>0?min+'m ':'')+a+'s)';
			}
			window.setTimeout("document.getElementById('"+IDtbl+"').ajxtbl.testrefreshtime('"+IDtbl+"')",1000);
		}catch(e){
			autorefrtimer=-1;
		}
	}
	
	this.zobr_field_by_IN=function(key){
		//test jestli zobrazit key, ale jen podle vstupních dat při vytáření, ignoruje SeCollVisible
		var a=flds[key];
		var ok=false;	
		if(a==undefined)ok=true;
		else if(a!='')ok=true;
		return ok;
	}
	this.zobr_field=function(key){
		//test jestli zobrazit key, bere v úvahu i změnu přes SetCollVisible
		var ok=this.zobr_field_by_IN(key);
		var a=flds_vis[key];
		if(a!=undefined){
			a=a.vis;
			if(a!=undefined)if(a==false)ok=false;
		}
		return ok;
	}

	this.SetCollVisible = function(fieldname,visible){
		if(flds_vis[fieldname]==undefined)flds_vis[fieldname] = {};
		flds_vis[fieldname].vis=visible;
		this.savecolsinfo();
	}
	
	this.get_real_name = function(key){
		var a=flds[key];
		return (a==undefined)?key:a;				
	}
	this.create_hd_td = function(tr,key){
		//eval('var a=flds.'+key);
		var b=this.get_real_name(key);
		var o=!/^!/i.test(b);
		b=String(b).replace(/^!/i,'');
		var td=tr.insertCell(-1);
		td.field=key;
		td.innerHTML='<span>' + b + '</span>';
		td.style.cursor='default';
		td.className='td'+td.cellIndex;

		td.tbl=ElTblObj;
		td.toto=this;
		
		var ad='disabled';
		if(ord_enable)
			if(o){
				td.onclick=this.setordertbclick;
				td.style.cursor='pointer';
				ad='enabled';
			}
		jQuery(td).addClass('ajax_tbl_td_head_'+ad);
		return td;
	}
	this.tr_make_tdhead=function(seznam,table,poz){
		//vytvoří řádek tabulky podle seznamu - určeno pro vytvoření head řádku
		//poz je pozice v tabulce buď 0 nahoře nebo -1 dole
		// vrací odkaz na vytvořený řádek tr
		if(poz==undefined)poz=0;
		if((poz!=0)&&(poz!=-1))poz=0;
		var tr=table.insertRow(poz);
		tr.className='ajaxtblheadinner';
		tr.toto=this;
		tr.tbl=ElTblObj;
		for(key in seznam){
			if(this.zobr_field(key)){
				var td = this.create_hd_td(tr,key);
			}
		}	
		return tr;
	}
	this.gen_tbl=function(d){
		//generování tabulky z dat
		var a,b,tb,tr,tr2,td,key,tb2,trh,ob;
		
		var pg=d.pg; 	// kolik stran je celkem
		var it=d.cnt; 	//celkový počet nalezených údajů
		var max=d.maxrow; //jaký max zobrazených řádků počet je definován
		var sel=d.sel;	// která strana je aktivní
		var chb='';

		if(JB.is.und(d.data)){
			if(JB.is.und(d.ArrData)){
				alert('Chybí data.');
				return;
			}
			d.data=JB.x.convertArrToObj(d.ArrData);
		}

		lastpg=sel;
		ELtbl.val=d; // pro možnost přístupu zvenku k datům
		
		//pokud se nejedná o refresh po kliknutí na upravu zobrazení sloupců
		var ok=false;
		if(typeof filtershow != 'undefined'){
			if(!filtershow)ok=true;
		}else{
			ok=true
		}
		if(ok){
			//tak otestuj jestli se načetlo info o sloupcích a nastav
			a=d.colsinfo;
			if(a!=undefined){
				flds_vis=a;
			}else{
				if(JB.is.und(flds_vis['input_max_rows'])) flds_vis['input_max_rows'] = {};
				flds_vis['input_max_rows'].vis=50;
			}
		}
		
		var cnt=d.length; //počet zobrazených údajů
		if(OnDtLd!=undefined){try{OnDtLd(ELtbl);}catch(e){
				chb += 'Error ondataload fn : '+e.message+'<br><br>';
		}}
		d=d.data;
		last_data=d;
		if(d.length>0){
			//vytvoř tabulku
			dv=JB.x.cel('div',{ob:tblb,style:{width:'100%'}});
			tb=JB.x.cel('table',{ob:dv,csN:'ajaxtblbodydata',style:{width:'100%'},ad:{toto:this,val:d}});
			ElTblObj=tb;
			tb2=tb;
			tb.multiselect=multiselect;
			
			//pokud nastaven selectable tak test jestli existuje v datech a podle toho se registruje ovládání, viz dále
			var selectuj=false;
			if(selectable!=''){
				if(typeof d[0][selectable] != undefined)selectuj=true;
			}
			
			for(a=0;a<d.length;a++){
				//before make table row
				if(OnBefTrCr!=undefined){try{OnBefTrCr(tb,d[a],d[a-1],a);}catch(e){
					chb += 'Error onTR fn : '+e.message+'<br><br>';
				}}
				//generuj z dat
				tr=tb.insertRow(-1);
				tr.className='ajaxtblbodyinner ajaxtblbodyinner_tr'+(a % 2);
				tr.tbl=tb;
				//pro možnost obarvit každou druhou jinak jak první
				tr.val=d[a];
				tr.toto=this;
				//zvýrazni při najetí
				tr.onmousemove=function(){jQuery(this).addClass(trCSS+'');}
				tr.onmouseout=function(){jQuery(this).removeClass(trCSS+'');}
				//při kliknutí na buňku
				tr.sel=false;
				if(selectuj){
					jQuery(tr).click(function(e){
						// selectování řádků
						//hl.kód
						var el;
						var tb=this.tbl;
						try{last_selected_val=this.val[selectable]}catch(e){last_selected_val=undefined;}; //todo select val
						if(e.ctrlKey && tb.multiselect){
							//sel/unsel
							this.sel=(!this.sel);
							setcsstr(this);
						}else if(e.shiftKey && tb.multiselect){
							// sell all mezi nejbližším vybraným nahoře včetně
							e.preventDefault();
							var a,d,f;
							d=tb.last_sel_tr_idx;
							if(JB.is.und(d))d=0;
							f=this.rowIndex;
							if(d>f){a=f,f=d,d=a}
							f++;
							for(a=d;a<f;a++){
								if(!tb.rows[a].sel){
									tb.rows[a].sel=true;
									setcsstr(tb.rows[a])
								};
							}
						}else{
							//unsell all a sel vybraný
							var el;
							for(var a=0; a<tb.rows.length;a++){
								if(tb.rows[a].sel!=undefined){
									tb.rows[a].sel=false;
									setcsstr(tb.rows[a]);
								}
								this.sel=true;
								setcsstr(this);
							}
						}
						//pokud nastaven input element tak nastav
						set_html_element();
						tb.last_sel_tr_idx=this.rowIndex;
					});
				}
				if(OnSel!=undefined){try{					
					jQuery(tr).click(OnSel);
				}catch(e){
					chb += 'Error onTR fn : '+e.message+'<br><br>';
				}}
				if(ondblclick!=undefined){
					try{jQuery(tr).dblclick(ondblclick);}catch(e){
						chb += 'Error ondblclick fn : '+e.message+'<br><br>';
					}
				}
				//before make table row
				if(OnTRc!=undefined){try{OnTRc(tr);}catch(e){
					chb += 'Error onTR fn : '+e.message+'<br><br>';
				}}
				// ******* buňka
				for(key in d[a]){
					if(this.zobr_field(key)){
						td=tr.insertCell(-1);
						td.innerHTML=d[a][key];
						td.val=d[a][key];
						td.field=key;
						td.className='td'+td.cellIndex;
						td.tr=tr.val;
						
						td.tbl=tb;
						td.toto=this;
						td.tr_el=tr;
						//on create TD
						if(OnDTc!=undefined){try{OnDTc(td);}catch(e){
							chb += 'Error onTD fn : '+e.message+'<br><br>';
						}}
					}
				}
				//after make table row
				if(OnTRce!=undefined){try{OnTRce(tb,d[a],d[a-1],a);}catch(e){
						chb += 'Error onTR fn : '+e.message+'<br><br>';
				}}
			}
			//vytvoř hlavičku
			//přidej popisky fieldů z head a potom schovej, pro správný výpočet šířek
			d=d[0];
			var trh=this.tr_make_tdhead(d,tb,-1);
			// vytvoř havičku i nahoře pro přehlednost
			var trhu=this.tr_make_tdhead(d,tb,0);
			// trh = spotní kopie head v tabulce
			// trhu je horní kopie head v tabulce
			tblh.innerHTML='';
			//nastav scroll body, pokud zadáno
			tr2=tb.rows[0];
			if(mxh!=undefined){//pokud je zadána max výška tak oprav CSS
				with(dv.style){
					overflow='scroll';
					display='block';
					height=mxh;
				};
				//vytvoř oddělenou head
				tb=JB.x.cel('table',{ob:tblh})
				var tr=this.tr_make_tdhead(d,tb,-1);
				//přepiš výšky
				tr.style.height=tr2.clientHeight+'px';
				//přepiš šířky
				var tmp_tx;
				for(a=0;a<tr2.cells.length;a++){
					tr.cells[a].innerHTML=tr.cells[a].innerHTML;
					//rozměry
					tr.cells[a].style.width = jQuery(tr2.cells[a]).css('width');		
				}
			}; // jinak pokud není, je výška neměnná a horní head bezpředmětná

			//pokud stránkování, tak nastav foot
			this.add_strankovani_text(tblf,sel,pg,cnt,it,max,true);
			//pokud je zadána max výška tak ještě oprav výšku hlavní DIV, ať nám to nebliká
			if(mxh!=undefined)
				if(ELtblH==undefined){
					ELtblH=(ELtbl.clientHeight+2)+'px';//2 je rezerva
					ELtbl.style.height=ELtblH;
				};
			this.err.set('');//smaž error hlášení
			
			tblr.innerHTML='';
			tblr.style.display='';
			gen_order_showstring(tblr);
			// přidej řazeno podle s refresh
			ob=JB.x.cel('div',{ob:tblr,csN:'ajaxtblheadotherbuttonmain',ad:{toto:this}});
			div_right_menu=ob;
			//tlačítko obnov
			if(offlinedata==undefined){
				a=JB.x.cel('div',{ob:ob,csN:'ajaxtblheadrefr ajaxheaderbuttonlink',ad:{toto:this,
					onclick:function(){
						try{this.toto.refresh();}catch(e){alert(e);}
						return false;
					}
				}});
				a=JB.x.tx(lang.tblrefr,{ob:a,pop:lang.tblrefr_alt,csN:'ajaxtblheadrefrlink ajaxheaderbuttoninnerlink'});
				autorefrtx=JB.x.tx('',{ob:a,csN:'ajaxtblheadrefrlink ajaxheaderbuttoninnerlink'});
			}
			
			//todo menu
			//tlačítko menu
			a=JB.x.cel('div',{ob:ob,csN:'ajaxtblheadmenu ajaxheaderbuttonlink',ad:{toto:this,
				onclick:function(){
					var btn=jQuery(div_right_menu);
					var div=jQuery(menu_div);
					var x=btn.offset();
					div.css('top',(x.top+btn.outerHeight)+'px');
					div.css('left',x.left+'px');
					div.toggle(300);
					return false;
				}
			}});
			JB.x.tx(lang.menubtn_tx,{ob:a,pop:lang.menubtn_alt,csN:'ajaxtblheadprintlink ajaxheaderbuttoninnerlink'});
			//DIV obsahující tlačítka menu
			menu_div=JB.x.cel('div',{ob:ob,id:IDtbl+'_ajax_tbl_menu_div',csN:'ajaxtblheadmenudiv'});
	
			// tlačítko tisk
			if(shpr)add_menu_btn(lang.print,{pop:lang.print_alt,onclick:function(){ELtbl.toto.print()}});
			if(selectuj){
				//sellAll
				add_menu_btn(lang.sellall,{pop:lang.sellall_alt,onclick:function(){ELtbl.toto.selAll()}});
				//deselAll
				add_menu_btn(lang.desellall,{pop:lang.desellall_alt,onclick:function(){ELtbl.toto.selClear()}});
				//invertSel
				add_menu_btn(lang.selinv,{pop:lang.selinv_alt,onclick:function(){ELtbl.toto.selInv()}});
			}
			//pokud stránkování, tak přidej z foot stránkování
			this.add_strankovani_text(tblr,sel,pg,cnt,it,max,false);
			//filtrování
			this.tblfin(ob);
			//tabulka finišuje
			if(OnTblFns!=undefined){try{OnTblFns(ELtbl);}catch(e){
				chb += 'Error ontablefinish fn : '+e.message+'<br><br>';
			}}
			if(chb!=''){this.err.set('');}
			//updatni texty
			this.setNadpis(nadp_text);
			this.setSouhrn(suma_text);
			this.setPopis(popis_text);

			tblr.style.display=((/^\s*$/.test(tblr.innerHTML))?'none':'');
			tblf.style.display=((/^\s*$/.test(tblf.innerHTML))?'none':'');
		}
	}
	function add_menu_btn(tx,o){
		// přidá menu button
		// o může mít
		//	.pop string popis
		//  .onclick  funkce po kliknutí
		if(JB.is.und(o))o={};
		var x={ob:menu_div,csN:'ajaxtblheadmenubtn ajaxheaderbuttonlink',ad:{toto:this}};
		if(!JB.is.und(o.onclick))
			x.ad.onclickfnin=o.onclick;
			x.ad.onclick=function(e){
				try{
					this.onclickfnin(e);
				}catch(e){alert(e)}
				jQuery('#'+IDtbl+'_ajax_tbl_menu_div').hide(300);
			};
		var a=JB.x.cel('div',x);
		x={ob:a,csN:'ajaxtblheadmenulink ajaxheaderbuttoninnerlink'};
		if(!JB.is.und(o.pop))x.pop=o.pop;
		JB.x.tx(tx,x);
	}
	this.add_strankovani_text = function(bunka,sel,pg,cnt,it,max,clear){
		// pokud clear true tak zmaže napřed cílovou buňku jinak přidá <br>
		if(it<=max)return;
		if(clear!=undefined)
			if(clear)
				bunka.innerHTML='';
			else
				JB.x.BR({ob:bunka});
		JB.x.tx(
			 lang.str+' : '+(sel+1) + '/'+(pg+1)+'&nbsp;'
			+lang.zob+' '+cnt+' '+lang.z+' '+it
			+' ('+lang.max+':'+max+')'
			+'&nbsp;&nbsp;&nbsp;&nbsp;'
		,{ob:bunka});
		JB.x.a ('_','','<<<',lang.predch_pg,{ob:bunka,ad:{toto:this,onclick:this.prev_pg}});
		JB.x.tx('&nbsp;&nbsp;&nbsp;&nbsp;',{ob:bunka})
		JB.x.a ('_','','>>>',lang.nasled_pg,{ob:bunka,ad:{toto:this,onclick:this.next_pg}});		
	}
	this.next_pg = function(){
		lastpg++;
		this.toto.refresh();
		return false;
	}
	this.prev_pg = function(){
		lastpg--;
		this.toto.refresh();
		return false;
	}
	
// ordering
//	var ordmax=2;//max počet řazení
//	var order_ren = new Object; //definice fieldů řezení

	function trans_ord(co){
		var j;
		co=String(co);
		if(co=='')return [];
		co+=',';
		var b=co.split(',')
		var o=[];
		for(var a=0;a<b.length;a++){
			if(b[a]!=''){
				j=false;
				if(/ desc/gi.test(b[a])){
					b[a]=b[a].replace(/ desc/gi,'');
					j=true;
				}
				o.push([b[a],j]);
			}
		}
		return o;
	}
	
	function gen_order_showstring(el){
		//vrátí řetězec pro informativní zobrazení řazení
		if(!ord_enable)return '';
		var o='';
		var y,p,x,n,b,e;
		n=JB.x.cel('div',{ob:el,csN:'ajaxtblheadordermain'});
		JB.x.cel('span',{ob:n,tx:lang.raz+' : ',csN:'ajaxtblheadordermaintx'});		
		for(var a=0;a<ord.length;a++){
			if(o!='')o += '/';
			p=ord[a][0];
			//eval('y=order_ren.'+p);
			y=order_ren[p];
			//eval('x=flds.'+p);
			x=flds[p];
			if(y!=undefined){
				if(y.s!=undefined)p=y.s;
				else if(x!=undefined) p=x;
			}else{
				if(x!=undefined) p=x;
			}
			p+=(ord[a][1])?'\u2191':'\u2193';//šipka nahoru nebo dolu
			
			if(a>0){
				JB.x.cel('span',{tx:'/',ob:n,csN:'ajaxtblheadordermainsplit'});
			}
			
			b=JB.x.cel('div',{ob:n,csN:'ajaxtblheadorder ajaxheaderbuttonlink'});
			JB.x.cel('a',{ob:b,tit:lang.ordby+ord[a][0],tx:p,csN:'ajaxtblheadorder ajaxheaderbuttoninnerlink'});
			b.chf=ord[a][0];
			b.totonm=ELtbl.id;
			b.onclick=function(){
				try{
					var el=document.getElementById(this.totonm).ajxtbl;
					el.changefield(this.chf);
				}catch(e){
					alert(e);
				}
				return false;
			}
		}
		return lang.raz+' : ' + o;
	}

	function get_order_string(){
		//funkce vrátí řetězec pro řazení SQL
		var y,p;
		var o='';
		for(var a=0;a<ord.length;a++){
			if(o!='')o += ',';
			//otestuj objekt order_ren
			p=ord[a][0];
			//otestuj definici  order_ren
			//eval('y=order_ren.'+p);
			y=order_ren[p];
			if(y!=undefined){
				if(ord[a][1]){
					if(y.da!=undefined)p=y.da;
				}else{
					if(y.dc!=undefined){p=y.dc;}
					else if(y.da!=undefined)p=y.da;				
				}
			}
			if(ord[a][0]==p) p+=(ord[a][1]?' desc':'');
			o += p;
		}
		return o;
	}
	
	this.setordertbclick = function(){
	//fn volaná při kliknutí na buňku tabulky
		if(OnHdCl!=undefined){
			if(OnHdCl(this)==false) return;
		}
		lastpg=0; // nuluj page
		
		var b=-1;
		for(var a=0;a<ord.length;a++){
			if(ord[a][0]==this.field)
				b=a;
		}
		if(b==0){
			//jen změň řazení
			ord[0][1]=(ord[0][1]?false:true);
		}else{
			if(b!=-1){
				//pokud nalezen jinde jak na 0 pozici tak smaž
				ord.splice(b,1);
			}
			//přidej na začátek
			ord.unshift([this.field,false]);
			while(ord.length>ordmax){
				ord.pop();
			}
		}
		
		this.parentNode.toto.refresh();
	}
	
	this.changefield = function(co){
		lastpg=0; // nuluj page
		var b=-1;
		for(var a=0;a<ord.length;a++){
			if(ord[a][0]==co)
				b=a;
		}	
		if(b!=-1){
			ord[b][1]=!ord[b][1];
		}
		ELtbl.ajxtbl.refresh();
	}
	
	// funkce pro nastavení order a parametrů zvenku
	this.SetOrder = function(inord){
		//order jako string - jako při vstupu viz nahoře
		ord=inord;
		lastpg=0; // nuluj page
		ELtbl.ajxtbl.refresh();
	}
	this.SetParam = function(par){
		//params jako object - jako při vstupu viz nahoře
		//convToUniEsc vlastní funkce escapující jen znaky s charcode nad 127 jako "u\hex" přidaná do string objektu přes prototype
		sqlp=JSON.stringify(par).convToUniEsc();
		lastpg=0; // nuluj page
		ELtbl.ajxtbl.refresh();
	}
	
//***********************************************************************************
//funkce generování DIV filtru pro tabulku
//***********************************************************************************
	this.tblfin = function(el){
		if(!shfltr) return;
		var b;
		//vytvoří filtr zobrazení sloupců pro tisk
		var nmel= IDtbl+'ajaxtbl_filtdiv_';
		var fl=el;
		if(fl==undefined)return;
		
		var fsh=el.toto.filtershow;
		if(fsh!=undefined)if(fsh)el.toto.filtershow=false;
		if(el!=undefined){
			a=JB.x.cel('div',{ob:fl,csN:'ajaxheaderbuttonlink ajaxtblhead_other',tx:lang.fltrdiv,ad:{
				onclick:function(){
					var m=this.dvfltrs;
					var x=JB.html.pos(div_right_menu);
					m.style.top = (x.top+div_right_menu.offsetHeight)+'px';
					m.style.left= (x.left+div_right_menu.offsetWidth-110)+'px';
					jQuery(m).toggle(300);
					return false;
				}
			}});
			//fl = DIV obálka
			dv_fl=JB.x.cel('div',{ob:fl,id:nmel+'_fltrs',csN:'ajaxtbl_fltr_body',style:{position:'absolute'}})
			//nech zobrazeno, pokud bylo voláno click na checkboxu
			if(!fsh)dv_fl.style.display='none';
			a.dvfltrs=dv_fl;
			
			//přidej checkboxy
			var d=el.toto.getTableRef().val.data[0];
			el.toto.filtershow=false;
			for(key in d){
				if(el.toto.zobr_field_by_IN(key)){
					b=JB.x.cel('div',{ob:dv_fl,csN:'ajaxheaderbuttonlink ajaxtbl_fltr_checkdiv'})
					keyr=el.toto.get_real_name(key);
					JB.x.cel('span',{ob:b,tx:keyr,style:{verticalAlign:'top'}});
					JB.x.cel('input',{ob:b,tp:'checkbox',nm:key,style:{verticalAlign:'top'},
						ad:{
							onchange:function(){
								this.toto.filtershow=true;
								this.toto.SetCollVisible(this.name,this.checked);
							},
							checked:el.toto.zobr_field(key),
							toto:el.toto
						}
					});					
				}
			}
			
			var mr=flds_vis['input_max_rows'];
			if(JB.is.und(mr)){
				mr=50;
			}else{
				mr=mr.vis;
			}
			
			a=JB.x.cel('div',{ob:dv_fl,csN:'ajaxheaderbuttonlink ajaxtbl_fltr_other'});
			JB.x.cel('span',{ob:a,tx:'Max.řádků:'})
			JB.x.cel('input',{ob:a,tp:'text',nm:'maxpocet',tit:'ENTER potvrdí, číslo 50-1000',val:String(mr),
				style:{width:'30px'},
				ad:{toto:this,
					onkeyup:function(event){
						var k=0;
						if(typeof window.event != 'undefined'){ // IE
							if(typeof window.event.keyCode != 'undefined')
								k = window.event.keyCode
						}else if(event!=undefined) if(event.which){ // Netscape/Firefox/Opera
							k = event.which
						}

						if(k==13){ //ENTER
							if(!JB.is.integer(jQuery(this).val())){
								alert('Musí být zadáno číslo!');
								return;
							}
							k=jQuery(this).val()*1;
							if((k<50)|(k>1000)){
								alert('Číslo musí být větší jak 49 a menší jak 1001');
								return;
							}
							this.toto.SetCollVisible('input_max_rows',k);
						}			
					}				
				}
			});
			
			//přidej reset
			a=JB.x.cel('div',{ob:dv_fl,csN:'ajaxtbl_fltr_reset',
				style:{cursor:'pointer'},
				ad:{toto:this,
					onclick:function(){
						this.toto.resetcols();
					}
				}
			});
			JB.x.cel('span',{tx:lang.rs_zobr,ob:a});
		}
	}	
	this.savecolsinfo = function(){
		jQuery.ajax({
			url: fscriptfilename,
			type:'post',
			data:{
				save:IDtbl,
				cols:JSON.stringify(flds_vis)
			}
		})
		.fail(function(){alert(lang.save_colsinfo);})
		.always(function(){ELtbl.ajxtbl.refresh()});
	}
	this.resetcols = function(){
		if(confirm(lang.rs_zobr_qe)){
			flds_vis = {};
			this.savecolsinfo();
		}
	}
	this.getTableRef=function(){
		return ELtbl;
	}
	
	this.print = function(){
		try{
			var dp='PrintJBajaxTable_';
			var a,b;
			var wn=window.open("","Tisk");
			var ndoc=wn.document;
			var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
			ndoc.body.innerHTML='';
			
			//add css
			var css=ndoc.createElement("link")
			css.setAttribute("rel", "stylesheet")
			css.setAttribute("type", "text/css")


			css.setAttribute("href", full+'/css/tisk_ajax_tbl.css')
			ndoc.getElementsByTagName("head")[0].appendChild(css)
			
			var md=JB.x.cel('div',{doc:ndoc,ob:ndoc,csN:dp+'cover'});
			var nadp=JB.x.cel('span',{doc:ndoc,ob:md,csN:dp+'napdis',tx:lang.generuji+' 0%'});
			nadp.style.color='white';
			nadp.style.backgroundColor='red';
			
			tb=JB.x.cel(('div'),{doc:ndoc,ob:md,csN:dp+'cover2'});
			
			b=String(this.getTableRef().innerHTML);
			tb.innerHTML=b
			
			var rl=ndoc.getElementsByTagName('a');
			for(a=0;a<rl.length;a++){
				rl[a].href='';
				rl[a].onclick=function(){
					return false;
				}
				b=String(rl[a].innerHTML);
				if(/(obnovit tabulku)|(tisk)|(((>)|(&(l|g)t;)){3})/gi.test(b))
					rl[a].innerHTML='';
			}
			nadp.style.color='';
			nadp.style.backgroundColor='';
			nadp.innerHTML=prnm;
			
			
			//wn.print();
			//wn.close();
		}catch(e){
			alert('ERR : ' + e);
		}
	}
		
	this.SetPrintName=function(nm){
		prnm=nm;
	}
	this.changeMultiselect=function(b){
		if(b==true)
			multiselect=true
		else
			multiselect=false;
	}
	this.val=function(x){
		if(x==undefined){
			//vrať hodnotu
			var v=[];
			var a,x;
			if(last_data[0][selectable]!=undefined){
				for(a=1;a<ElTblObj.rows.length;a++){
					if(ElTblObj.rows[a].sel){
						if(!JB.is.und(ElTblObj.rows[a].val)){
							x=ElTblObj.rows[a].val[selectable];
							if(!JB.is.und(x))
								v.push(String(x));
						}
					}
				}
			}
			return v;
		}else{
			//pokus se nastvit / vybrat hodnoty a nastav css
			if(typeof x == typeof []){
				var b;
				if(last_data[0][selectable]!=undefined){
					for(a=1;a<ElTblObj.rows.length;a++){
						b=x.indexOf(String(ElTblObj.rows[a].val[selectable]));
						ElTblObj.rows[a].sel= b>-1;
						setcsstr(ElTblObj.rows[a]);
					}
				}
			}
		}
	}
	function set_html_element(){
		//pokud nastaveno, tak vyplní form HTML element vybranými hodnotami
		var x;
		try{	
			if(!JB.is.und(set_element_on_sel)){
				var el=JB.x.el(set_element_on_sel);
				if(!JB.is.und(el)){
					el=jQuery(el);
					a=ElTblObj.toto.val();
					if(sel_element_json)a=JSON.stringify(a);
					el.val(a);
				}
			}
			if(!JB.is.und(set_HTMLinner_on_sel)){
				el=JB.x.el(set_HTMLinner_on_sel);
				if(!JB.is.und(el)){
					x=ElTblObj.toto.val();
					el.innerHTML=x;
				}
			}
		}catch(e){
		}
	}
	this.GetLastSelectedVal=function(){
		return last_selected_val;
	}
	this.selAll=function(){
		var a,b;
		for(a=1;a<ElTblObj.rows.length;a++){
			ElTblObj.rows[a].sel=true;
			setcsstr(ElTblObj.rows[a]);
		}
		set_html_element();
	}
	this.selClear=function(){
		var a,b;
		for(a=1;a<ElTblObj.rows.length;a++){
			ElTblObj.rows[a].sel=false;
			setcsstr(ElTblObj.rows[a]);
		}
		set_html_element();
	}
	this.selInv=function(){
		var a,b;
		for(a=1;a<ElTblObj.rows.length;a++){
			ElTblObj.rows[a].sel=!ElTblObj.rows[a].sel;
			setcsstr(ElTblObj.rows[a]);
		}
		set_html_element();
	}
	//todo dodělat menu výběru, vše, nic, invert

	
	//END
	this.init(in_sqlname,in_idtbl,in_p);
}
