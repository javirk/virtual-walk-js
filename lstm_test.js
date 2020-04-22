let model;
let data_x;
let data_y;

async function loadModel(){
	return await tf.loadLayersModel('http://localhost:8000/model/LSTM/model.json');
}

async function prepareData(){
	var time_steps = 5;
	var joints = 14;
	const raw = [-0.033879086584207116,-1.2296875521751955,0.014024691981519177,-1.3568226230392444,-0.07156086619726328,-1.382102701405891,0.08352659379368392,-1.3084008478975695,-0.11140939714424138,-1.2790784442966971,0.1740183776741524,-0.4361319509932499,-0.14269726896423787,-0.39509574205757797,0.2548764938747307,0.6587752988548289,-0.19625973782016384,0.6194583831126632,0.269505799940465,1.4993250219125853,-0.17591205216815195,1.6155019487509674,0.14134980934218025,1.62579547388747,-0.09317037073195496,1.626583686245221,0.015660554354957258,-0.41561384652541394,-0.025355329679835625,-1.2565190579795067,0.021770130395727998,-1.3802665158212908,-0.06706260676601883,-1.382522776142376,0.08216673807159515,-1.3196514901911414,-0.11055256202695615,-1.287706314976837,0.16910555739046515,-0.4352202731650214,-0.1482478492645126,-0.39267224091259684,0.2669458233826068,0.6909426881986959,-0.2004804172827149,0.6223983867463186,0.2659687522795177,1.4970897984572469,-0.18856219483136313,1.6520153444906123,0.129516630541926,1.7071102107148075,-0.09551822810129683,1.6825304024754462,0.010428854062976285,-0.4139462570388091,-0.019073941329747806,-1.2674322370222675,0.02746291659023015,-1.3863555515305699,-0.060442998669058466,-1.3872942444891847,0.0798812793622589,-1.3229092679546604,-0.1055787185876443,-1.2932744510859187,0.16367271683563056,-0.41094291692889695,-0.15767079163298844,-0.3998525433269084,0.25010887565502915,0.6722085950272743,-0.2128267290334269,0.6096266525670128,0.2641510875445327,1.4894419114199575,-0.20944003392259367,1.5890073791464288,0.11440293136081509,1.6483057484594745,-0.1096994700453685,1.6179288983156022,0.0030009626013210566,-0.4053977301279027,-0.014993818082458329,-1.2689684853900158,0.029535633888231244,-1.3834546023788858,-0.053395707922296635,-1.3910844943878522,0.07512504733020285,-1.316612784956529,-0.10683397228467652,-1.3127651354350915,0.15976590714034872,-0.4060274883555039,-0.16619346087227505,-0.3988016939072477,0.24415545752317605,0.687925260767448,-0.32216516318088995,0.5897960861792262,0.24965164966981362,1.528488321981135,-0.20898394949577803,1.6155604363576677,0.0938841344336229,1.709027746627239,-0.12896155080693458,1.704328311098826,-0.003213776865963166,-0.4024145911313758,-0.024108645019891163,-1.243090490207809,0.01912391714647702,-1.3690194875919846,-0.06679711849745844,-1.366867733962583,0.07180132900766363,-1.3087327997003753,-0.11308566541818973,-1.2969440251199638,0.1539885192735193,-0.41699367367416185,-0.19141491987639597,-0.3969104691356007,0.25036542743208123,0.7168978869464538,-0.20906362341294288,0.6821748704091667,0.25358153550270746,1.6315505926464988,-0.20313594668809898,1.7216073198801416,0.08474708140313765,1.7647744055771053,-0.12081004727786913,1.7543605365710768,-0.018713200301438325,-0.40695207140488127,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.005491042035984498,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.01132479067853449,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.006893627848877525,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.01614994904216753,0.008523756904371491,-0.02683150580431115,0.00774543841420882,-0.023443892782046394,0.004498259431244447,-0.0004200747364848656,-0.0013598557220887708,-0.011250642293571866,0.0008568351172852234,-0.008627870680139926,-0.0049128202836872525,0.0009116778282285409,-0.005550580300274721,0.0024235011449811328,0.012069329507876092,0.03216738934386698,-0.004220679462551058,0.0029400036336554303,-0.0035370476609472568,-0.002235223455338442,-0.012650142663211184,0.03651339573964485,-0.011833178800254252,0.08131473682733747,-0.0023478573693418714,0.05594671623022518,-0.005231700291980973,0.0016675894866048369,0.006281388350087819,-0.01091317904276079,0.005692786194502152,-0.0060890357092791,0.006619608096960362,-0.004771468346808749,-0.0022854587093362466,-0.0032577777635189875,0.004973843439311856,-0.005568136109081578,-0.005432840554834589,0.024277356236124426,-0.00942294236847585,-0.007180302414311557,-0.016836947727577656,-0.018734093171421606,-0.012346311750711991,-0.012771734179305883,-0.001817664734985014,-0.007647887037289358,-0.020877839091230532,-0.06300796534418351,-0.015113699181110912,-0.05880446225533298,-0.014181241944071665,-0.064601504159844,-0.007427891461655229,0.008548526910906407,0.004080123247289477,-0.0015362483677483496,0.0020727172980010942,0.0029009491516840402,0.007047290746761831,-0.003790249898667497,-0.004756232032056051,0.0062964829981313475,-0.0012552536970322214,-0.019490684349172893,-0.003906809695281843,0.004915428573393055,-0.008522669239286601,0.0010508494196607154,-0.0059534181318531,0.01571666574017372,-0.10933843414746305,-0.019830566387786575,-0.014499437874719079,0.039046410561177414,0.0004560844268156339,0.026553057211238906,-0.02051879692719219,0.06072199816776447,-0.01926208076156609,0.08639941278322394,-0.006214739467284222,0.002983138996526913,-0.009114826937432834,0.025877995182206792,-0.010411716741754225,0.014435114786901293,-0.013401410575161803,0.024216760425269213,-0.003323718322539221,0.007879985256153743,-0.006251693133513217,0.015821110315127784,-0.005777387866829409,-0.01096618531865795,-0.025221459004120927,0.0018912247716469932,0.006209969908905183,0.028972626179005867,0.11310153976794707,0.0923787842299405,0.003929885832893831,0.10306227066536389,0.0058480028076790536,0.10604688352247393,-0.009137053030485245,0.0557466589498663,0.008151503529065449,0.050032225472250724,-0.01549942343547516,-0.004537480273505479,'walk']
	var y = raw.slice(-1)[0];
	var x = tf.tensor(raw.slice(0, joints * 2 * time_steps));
	x = x.reshape([1, time_steps, joints * 2]);
	return [x, y];
}

async function execute(){
	let xy;
	model = await loadModel();
	xy = await prepareData();
	data_x = xy[0];
	data_y = xy[1];

	var output = model.predict(data_x);
	console.log('Real ' + data_y);
	console.log('Predicted ' + output);
}

execute()
