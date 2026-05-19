import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Calculator, Download, RotateCcw, TrendingUp, Home, AlertTriangle } from 'lucide-react';
import './styles.css';

const number = (v) => Number(String(v).replace(/,/g, '')) || 0;
const won = (v) => new Intl.NumberFormat('ko-KR').format(Math.round(v)) + '원';
const eok = (v) => {
  if (!Number.isFinite(v)) return '-';
  const n = Math.round(v / 10000) / 100;
  return `${n.toLocaleString('ko-KR')}억`;
};
const pct = (v) => `${(Number.isFinite(v) ? v : 0).toFixed(2)}%`;

const defaults = {
  appraisalPrice: 500000000,
  minimumPrice: 350000000,
  bidPrice: 380000000,
  expectedSalePrice: 450000000,
  monthlyRent: 1500000,
  holdingMonths: 12,
  loanRatio: 70,
  annualInterestRate: 5.2,
  acquisitionTaxRate: 4.6,
  legalFee: 2500000,
  repairCost: 15000000,
  evictionCost: 5000000,
  unpaidFee: 1000000,
  brokerFee: 3000000,
  saleTax: 5000000,
  otherCost: 1000000
};

function Field({ label, value, onChange, suffix = '원', help }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="inputWrap">
        <input value={Number(value).toLocaleString('ko-KR')} onChange={(e) => onChange(number(e.target.value))} inputMode="numeric" />
        <em>{suffix}</em>
      </div>
      {help && <small>{help}</small>}
    </label>
  );
}

function PercentField({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="inputWrap">
        <input value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} inputMode="decimal" />
        <em>%</em>
      </div>
    </label>
  );
}

function App() {
  const [form, setForm] = useState(defaults);
  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const r = useMemo(() => {
    const bid = form.bidPrice;
    const appraisal = form.appraisalPrice;
    const minimum = form.minimumPrice;
    const sale = form.expectedSalePrice;
    const acquisitionTax = bid * form.acquisitionTaxRate / 100;
    const purchaseCost = acquisitionTax + form.legalFee + form.repairCost + form.evictionCost + form.unpaidFee + form.otherCost;
    const totalInvestment = bid + purchaseCost;
    const loan = bid * form.loanRatio / 100;
    const equity = Math.max(totalInvestment - loan, 0);
    const interest = loan * form.annualInterestRate / 100 * form.holdingMonths / 12;
    const rentIncome = form.monthlyRent * form.holdingMonths;
    const saleCost = form.brokerFee + form.saleTax;
    const netProfit = sale + rentIncome - bid - purchaseCost - interest - saleCost;
    const roi = equity > 0 ? netProfit / equity * 100 : 0;
    const annualRoi = form.holdingMonths > 0 ? roi * 12 / form.holdingMonths : 0;
    const bidRate = appraisal > 0 ? bid / appraisal * 100 : 0;
    const minRate = appraisal > 0 ? minimum / appraisal * 100 : 0;
    const breakEvenSale = bid + purchaseCost + interest + saleCost - rentIncome;
    const safetyMargin = sale - breakEvenSale;
    return { acquisitionTax, purchaseCost, totalInvestment, loan, equity, interest, rentIncome, saleCost, netProfit, roi, annualRoi, bidRate, minRate, breakEvenSale, safetyMargin };
  }, [form]);

  const reset = () => setForm(defaults);
  const print = () => window.print();

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">ONBIT APPRAISAL & CONSULTING</p>
          <h1>경매수익률계산기</h1>
          <p className="desc">낙찰가, 대출, 취득비용, 명도·수리비, 보유기간, 임대수익과 매각가를 반영하여 자기자본수익률과 손익분기 매도가를 계산합니다.</p>
        </div>
        <div className="heroIcon"><Calculator size={44} /></div>
      </section>

      <section className="summaryGrid">
        <div className="card primary"><span>예상 순이익</span><strong>{won(r.netProfit)}</strong><small>매각·임대수익 - 총비용</small></div>
        <div className="card"><span>자기자본수익률</span><strong>{pct(r.roi)}</strong><small>순이익 ÷ 필요 자기자본</small></div>
        <div className="card"><span>연환산 수익률</span><strong>{pct(r.annualRoi)}</strong><small>보유기간 기준 단순 환산</small></div>
        <div className="card"><span>손익분기 매도가</span><strong>{won(r.breakEvenSale)}</strong><small>이 가격 이상이어야 손실 회피</small></div>
      </section>

      <section className="layout">
        <div className="panel">
          <div className="panelTitle"><Home size={20} /><h2>1. 물건·입찰 정보</h2></div>
          <Field label="감정가" value={form.appraisalPrice} onChange={set('appraisalPrice')} />
          <Field label="최저가" value={form.minimumPrice} onChange={set('minimumPrice')} />
          <Field label="예상 낙찰가" value={form.bidPrice} onChange={set('bidPrice')} />
          <Field label="예상 매도가" value={form.expectedSalePrice} onChange={set('expectedSalePrice')} />
          <div className="miniStats"><span>최저가율 {pct(r.minRate)}</span><span>낙찰가율 {pct(r.bidRate)}</span></div>
        </div>

        <div className="panel">
          <div className="panelTitle"><TrendingUp size={20} /><h2>2. 대출·수익 정보</h2></div>
          <PercentField label="대출비율" value={form.loanRatio} onChange={set('loanRatio')} />
          <PercentField label="연 이자율" value={form.annualInterestRate} onChange={set('annualInterestRate')} />
          <Field label="월 임대료" value={form.monthlyRent} onChange={set('monthlyRent')} />
          <Field label="보유기간" value={form.holdingMonths} onChange={set('holdingMonths')} suffix="개월" />
        </div>

        <div className="panel">
          <div className="panelTitle"><Calculator size={20} /><h2>3. 취득·보유·매각 비용</h2></div>
          <PercentField label="취득세 등 비율" value={form.acquisitionTaxRate} onChange={set('acquisitionTaxRate')} />
          <Field label="법무·등기비" value={form.legalFee} onChange={set('legalFee')} />
          <Field label="수리비" value={form.repairCost} onChange={set('repairCost')} />
          <Field label="명도비" value={form.evictionCost} onChange={set('evictionCost')} />
          <Field label="체납관리비" value={form.unpaidFee} onChange={set('unpaidFee')} />
          <Field label="매각 중개비" value={form.brokerFee} onChange={set('brokerFee')} />
          <Field label="양도세 등 매각세금" value={form.saleTax} onChange={set('saleTax')} />
          <Field label="기타비용" value={form.otherCost} onChange={set('otherCost')} />
        </div>

        <div className="panel result">
          <div className="panelTitle"><Download size={20} /><h2>4. 결과 요약</h2></div>
          <table>
            <tbody>
              <tr><th>총 취득부대비용</th><td>{won(r.purchaseCost)}</td></tr>
              <tr><th>총 투자금</th><td>{won(r.totalInvestment)}</td></tr>
              <tr><th>대출금</th><td>{won(r.loan)}</td></tr>
              <tr><th>필요 자기자본</th><td>{won(r.equity)}</td></tr>
              <tr><th>보유기간 이자</th><td>{won(r.interest)}</td></tr>
              <tr><th>임대수익</th><td>{won(r.rentIncome)}</td></tr>
              <tr><th>안전마진</th><td className={r.safetyMargin >= 0 ? 'good' : 'bad'}>{won(r.safetyMargin)}</td></tr>
            </tbody>
          </table>
          <div className="buttons">
            <button onClick={print}><Download size={18}/> PDF 저장/인쇄</button>
            <button className="ghost" onClick={reset}><RotateCcw size={18}/> 초기화</button>
          </div>
          <div className="notice"><AlertTriangle size={18}/> 본 계산기는 간이 검토용입니다. 취득세, 양도세, 대출조건, 권리관계, 명도비, 배당관계는 실제 사건별로 달라질 수 있습니다.</div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
