/*
$NOTE: ********************* JavaScript Ajax table ********************
v 2.2.7
by Dvestezar www.dvesstezar.cz
využívá knihovny
  - jQuery (psáno s 1.8.3)
  - JB

následující je globální language proměnná
*/
var JBajaxtable_var = {
	lang : {
		raz : 'Řazeno podle',
		str : 'Strana',
		zob : 'zobrazeno',
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
		end : 'Konec',
		reachedminpage:'Dosáhl jsi první strany.',
		reachedmaxpage:'Dosáhl jsi poslední strany.'
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
	var ExtElerr=false;//false pokud je error element ve foot tabulky
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
	var lastpg = 0; //zobrazená stránka - načteno při posledním generování tabulky
	var maxpages = 0; //kolik stran je k dispozici - načteno při posledním generování tabulky
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
	var ontdcontext;
	var ontrcontext;
	
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
				sqlp=JSON.stringify(p.sqlparam).convToUniEsc();
			if(p.sqlparamfn!=undefined)
				sqlparamfn=p.sqlparamfn;
			b='';
			ExtElerr=false;
			if(p.elementerror!=undefined){
				if(String(p.elementerror.tagName).toLowerCase()=='div'){
					//použij zadaný externí element pokud je DIV
					ELerr=p.elementerror;
					ExtElerr=true;// nastav, že se jedná o externí div - jen informativní
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
			if(p.ontdcontext!=undefined)
				ontdcontext=p.ontdcontext;
			if(p.ontrcontext!=undefined)
				ontrcontext=p.ontrcontext;				
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
		if(ELerr!=undefined){
			ELerr.innerHTML=x;
		}
	}
	this.err.add = function(x){
		if(ELerr!=undefined){
			ELerr.innerHTML+='<br />'+x;
		}
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
	
	function escape_internac_char(x){
		var key;
		for(key in x){
			if(typeof x[key] == 'string'){
				x[key]=x[key].convToUniEsc();
			}else
			if(typeof x[key] == 'object'){
				x[key]=escape_internac_char(x[key]);
			}
		}
		return x;
	}
	this.refresh = function(){
		var b,el,d,dd;

		//sqlp je již hotový řetězec JSON na poslání - není potřeba jej nijak měnit
		if(sqlparamfn!=undefined){
			//při volání funkce se musí sqlp převést na objekt
			try{
				b=JSON.parse(sqlp);
			}catch(e){
				b={};
			}
			try{
				b=sqlparamfn(b);
			}catch(e){
				alert('Chyba scriptu : event sqlparamfn - '+e);
				b=null;
			}
			if(b==null)
				return false;
			sqlp=JSON.stringify(b).convToUniEsc();
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
			mr=20;
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
		// $NOTE: prijem dat a volnani generovani tabulky
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
			ELtbl.val=a;			
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
					
					//toto je definováno i ve funkci this.gen_tbl,
					//redefinováno tady	protože při empty data by ondadaloaded nenastalo
					if(OnDtLd!=undefined){try{OnDtLd(ELtbl,true);}catch(e){
						this.err.add('Error ondataloaded fn : '+e.message+'<br><br>');
					}}

					//tabulka finišuje
					//toto je definováno i ve funkci this.gen_tbl
					//redefinováno tady	protože protože při empty data by nebylo voláno
					if(OnTblFns!=undefined){try{OnTblFns(ELtbl,true);}catch(e){
						this.err.add('Error ontablefinish fn : '+e.message);
					}}
					
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
		
		// $TODO: pridat onclickcolsort
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
		// $NOTE: generovani tabulky z dat
		var a,b,tb,tr,tr2,td,key,tb2,trh,ob;
		
		var pg=d.pg; 	// kolik stran je celkem
		maxpages=d.pg; //glob var kolik stran je k dispozici
		var it=d.cnt; 	//celkový počet nalezených údajů
		var max=d.maxrow; //jaký max zobrazených řádků počet je definován
		var sel=d.sel;	// která strana je aktivní
		var chb='';		// chyby této funkce, na konci se přičtou do lementu, v průběhu event funkcí lze
						// používat tento_objekt.err.add(tx)
		
		this.err.set('');//smaž error hlášení

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
				flds_vis['input_max_rows'].vis=20;
			}
		}
		
		//toto je definováno i ve funkci this.gen, protože při empty data by nebylo voláno
		if(OnDtLd!=undefined){try{OnDtLd(ELtbl,false);}catch(e){
				chb += 'Error ondataloaded fn : '+e.message+'<br><br>';
		}}
		
		
		d=d.data;
		last_data=d;
		var cnt=d.length; //počet zobrazených údajů
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
				
				//this.err.add('Test err');//testovací chyba v průběhu
				
				// $FIX: OK Komletne opravit onclick - nevyuzivat jQuery a odchytit err do div err elementu
				if(selectuj){
					tr.selectujFN=function(e){
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
					};
				}
				
				// $FIX: OK kompletne opravit onselect -  nevyuzivat jQuery a odchytit err do div err elementu
				if(OnSel!=undefined){try{					
					tr.onclickRun=OnSel;
				}catch(e){
					chb += 'Error onTR fn : '+e.message+'<br><br>';
				}}
				
				if((tr.selectujFN!=undefined)||(tr.onclickRun!=undefined)){
					jQuery(tr).mousedown(
						//tr.onclick=
						function(event){
							if(event.which==1){ //jen pokud leftclick
								//zavolej selectování pokud zadáno
								try{
									if(this.selectujFN!=undefined){
										this.selectujFN(event);
									}
								}catch(e){
									this.toto.err.add('Error onclick - select fn : '+e.message+'<br><br>');					
								}
								// zavolej onclick pokud zadáno
								try{
									if(this.onclickRun!=undefined){
										this.onclickRun(event);
									}
								}catch(e){
									this.toto.err.add('Error onclick - click fn : '+e.message+'<br><br>');					
								}
							}
							event.stopImmediatePropagation();
						}
					)
				}
				if(ontrcontext!=undefined){
					tr.ontrcontext=ontrcontext;
					jQuery(tr).bind("contextmenu",function(event){
						try{
							if(event.which==3){ //right click
								return this.ontrcontext(event,this);
								return false;
							}
						}catch(e){
							this.toto.err.add('Error ontrcontext - click fn : '+e.message+'<br><br>');
						}
					});
				}
				
				// $FIX: OK oprava ondblclick
				if(ondblclick!=undefined){
					tr.runondblclick=ondblclick;
					tr.ondblclick=function(){
						try{
							this.runondblclick(this);
							// this.toto.err.add('tr dblclick test ok');
						}catch(e){
							this.toto.err.add('Error ondblclick fn : '+e.message+'<br><br>');
						}
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
						// $TODO přidat ontdclick
						if(ontdcontext!=undefined){
							td.ontdcontext=ontdcontext;
							jQuery(td).bind('contextmenu',function(event){
								try{
									if(event.which==3){ //right click
										return this.ontdcontext(event,this);
										return false;
									}
								}catch(e){
									this.toto.err.add('Error ontdcontext - click fn : '+e.message+'<br><br>');
								}
							});
						}						
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
				//jQuery(tr2).hide();
			}; // jinak pokud není, je výška neměnná a horní head bezpředmětná

			//pokud stránkování, tak nastav foot
			this.add_strankovani_text(tblf,sel,pg,cnt,it,max,true);
			//pokud je zadána max výška tak ještě oprav výšku hlavní DIV, ať nám to nebliká
			if(mxh!=undefined)
				if(ELtblH==undefined){
					ELtblH=(ELtbl.clientHeight+2)+'px';//2 je rezerva
					ELtbl.style.height=ELtblH;
				};
			
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
			if(chb!=''){this.err.add(chb);}
			//updatni texty
			this.setNadpis(nadp_text);
			this.setSouhrn(suma_text);
			this.setPopis(popis_text);

			tblr.style.display=((/^\s*$/.test(tblr.innerHTML))?'none':'');
			tblf.style.display=((/^\s*$/.test(tblf.innerHTML))?'none':'');
			
			if(mxh!=undefined){//pokud je zadána max výška tak oprav CSS hlavní obálky
				a=jQuery(mtbl).outerHeight();
				jQuery(ELtbl).innerHeight(a);
			}
		}else{
			if(chb!=''){this.err.add(chb);}		
		}
		//tabulka finišuje
		//toto je definováno i ve funkci this.gen, protože při empty data by nebylo voláno
		if(OnTblFns!=undefined){try{OnTblFns(ELtbl,false);}catch(e){
			this.err.add('Error ontablefinish fn : '+e.message);
		}}
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
		if(lastpg>=maxpages){
			alert(lang.reachedmaxpage);
			return false;
		}
		lastpg++;
		this.toto.refresh();
		return false;
	}
	this.prev_pg = function(){
		if(lastpg<1){
			alert(lang.reachedminpage);
			return false;
		}
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
				mr=20;
			}else{
				mr=mr.vis;
			}
			
			a=JB.x.cel('div',{ob:dv_fl,csN:'ajaxheaderbuttonlink ajaxtbl_fltr_other'});
			JB.x.cel('span',{ob:a,tx:'Max.řádků:'})
			JB.x.cel('input',{ob:a,tp:'text',nm:'maxpocet',tit:'ENTER potvrdí, číslo 20-1000',val:String(mr),
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
							if((k<20)|(k>1000)){
								alert('Číslo musí být větší jak 19 a menší jak 1001');
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
	// $TODO: 
	this.getLastData=function(){
		return ELtbl.val;
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
